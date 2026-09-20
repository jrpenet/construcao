painel.js:
(function setupPainelNavigation() {
    const painel = document.getElementById('telaPainel');
    const content = painel && painel.querySelector('.painel-content');
    if (!painel || !content) return;
    const groups = {
        info: /contato|template|destaques|highlights|logotipo|configurações da agenda|horários de funcionamento|serviços/i,
        calendario: /agendamentos|bloquear datas/i,
        integracoes: /google agenda|whatsapp.*lembretes/i,
        recebimentos: /recebimentos|pagar\.me/i,
        assinatura: /assinatura e conta/i
    };
    const wrappers = {};
    Object.keys(groups).forEach(function(key) {
        const wrapper = document.createElement('div');
        wrapper.className = 'painel-group' + (key === 'info' ? ' active' : '');
        wrapper.dataset.panelGroup = key;
        content.appendChild(wrapper);
        wrappers[key] = wrapper;
    });
    let current = 'assinatura';
    Array.from(content.children).slice(0, -5).forEach(function(element) {
        const text = ((element.innerText || element.textContent || '') + ' ' + (element.id || '')).trim();
        const heading = element.matches('h2,h3,h4') ? text : '';
        if (heading) Object.keys(groups).some(function(key) { if (groups[key].test(heading)) { current = key; return true; } return false; });
        if (element.id === 'statusAssinatura' || element.id === 'acoesConta' || element.id === 'btnLogout') current = 'assinatura';
        if (element.id === 'pagarmeRecipientStatus') current = 'recebimentos';
        if (element.id === 'listaAgendamentos' || element.id === 'formBloquearData') current = 'calendario';
        if (element.id === 'statusGoogle' || element.id === 'formWhatsappMeta' || element.id === 'testeWhatsappMeta') current = 'integracoes';
        wrappers[current].appendChild(element);
    });
    painel.classList.add('painel-shell');
    painel.querySelectorAll('[data-panel-target]').forEach(function(button) {
        button.addEventListener('click', function() {
            const target = button.dataset.panelTarget;
            painel.querySelectorAll('[data-panel-target]').forEach(function(item) { item.classList.toggle('active', item === button); });
            painel.querySelectorAll('[data-panel-group]').forEach(function(group) { group.classList.toggle('active', group.dataset.panelGroup === target); });
            if (window.innerWidth <= 760) window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
})();

const telaLogin = document.getElementById('telaLogin');
const telaPainel = document.getElementById('telaPainel');
const formLogin = document.getElementById('formLogin');
const mensagemLogin = document.getElementById('mensagemLogin');
const statusAssinatura = document.getElementById('statusAssinatura');
const acoesConta = document.getElementById('acoesConta');
const btnCancelarAssinatura = document.getElementById('btnCancelarAssinatura');
const btnExcluirConta = document.getElementById('btnExcluirConta');
const mensagemAcoesConta = document.getElementById('mensagemAcoesConta');
const statusGoogle = document.getElementById('statusGoogle');
const listaServicos = document.getElementById('listaServicos');
const formNovoServico = document.getElementById('formNovoServico');
const btnLogout = document.getElementById('btnLogout');
const formConfiguracoes = document.getElementById('formConfiguracoes');
const formHorariosFuncionamento = document.getElementById('formHorariosFuncionamento');
const containerDiasHorarios = document.getElementById('containerDiasHorarios');
const formLogo = document.getElementById('formLogo');
const inputLogo = document.getElementById('inputLogo');
const previewLogo = document.getElementById('previewLogo');
const formPagarmeRecipient = document.getElementById('formPagarmeRecipient');
const recipientType = document.getElementById('recipientType');
const recipientPFFields = document.getElementById('recipientPFFields');
const recipientPJFields = document.getElementById('recipientPJFields');
//const topoLogoImg = document.getElementById('topoLogoImg');
const formTemplateImage =    document.getElementById('formTemplateImage');
const inputTemplateImage = document.getElementById('inputTemplateImage');
const previewTemplateImage = document.getElementById('previewTemplateImage');



/*
==================================================
AO CARREGAR: já tem token válido?
==================================================
*/

(async function iniciar() {

    if (!getToken()) {
        mostrarLogin();
        return;
    }

    const dados = await getMe();

    if (dados && dados.success) {
        mostrarPainel(dados.tenant);
    } else {
        mostrarLogin();
    }

})();


function mostrarLogin() {
    telaLogin.style.display = '';
    telaPainel.style.display = 'none';
}

function mostrarPainel(tenant) {

    telaLogin.style.display = 'none';
    telaPainel.style.display = '';

    renderStatusAssinatura(tenant.subscription);
    renderLogo(tenant);
    renderPagarmeRecipient(tenant);
    renderContato(tenant);
    renderConfiguracoes(tenant);
    renderFormularioHorarios(tenant.business_hours);
    renderStatusGoogle();
    renderServicos(tenant.services);
    carregarAgendamentos();
    carregarDatasBloqueadas();
    renderDestaques(tenant);
    renderHighlights(tenant);
    renderTemplateImage(tenant);

    // ADICIONE ESTE BLOCO PARA O CAMPO DE CAPACIDADE
    const blocoCapacidade = document.getElementById('blocoCapacidade');
    // Ajuste conforme o formato que o seu objeto tenant/subscription retorna o plano
    if (tenant.subscription && tenant.subscription.plan_slug === 'pro') {
        blocoCapacidade.style.display = 'block';
    } else {
        blocoCapacidade.style.display = 'none';
    }
}


function toggleRecipientTypeFields() {
    const pj = recipientType.value === 'corporation';
    recipientPFFields.style.display = pj ? 'none' : 'block';
    recipientPJFields.style.display = pj ? 'block' : 'none';

    ['recipientName','recipientMotherName','recipientBirthdate','recipientMonthlyIncome','recipientOccupation'].forEach(id => {
        document.getElementById(id).required = !pj;
    });

    ['recipientCompanyName','recipientTradingName','recipientAnnualRevenue','recipientCorporationType','recipientFoundingDate','partnerName','partnerEmail','partnerDocument','partnerMotherName','partnerBirthdate','partnerIncome','partnerOccupation'].forEach(id => {
        document.getElementById(id).required = pj;
    });
}

recipientType.addEventListener('change', toggleRecipientTypeFields);
toggleRecipientTypeFields();

function renderPagarmeRecipient(tenant) {
    const info = document.getElementById('pagarmeRecipientInfo');
    const form = formPagarmeRecipient;

    if (tenant.pagarme_recipient_id) {
        form.style.display = 'none';
        info.innerHTML = `
            <div style="padding:12px; border-radius:6px; background:#eef8ee; border:1px solid #b7d8b7;">
                <strong>Recebimentos cadastrados</strong><br>
                ID: ${escapeHtml(tenant.pagarme_recipient_id)}<br>
                Tipo: ${tenant.pagarme_recipient_type === 'corporation' ? 'Pessoa Jurídica' : 'Pessoa Física'}<br>
                Status: <span id="recipientStatusText">${escapeHtml(tenant.pagarme_recipient_status || 'consultando...')}</span>
            </div>`;
        atualizarStatusRecipient();
        return;
    }

    form.style.display = '';
    info.innerHTML = '<p style="margin-top:0; color:#555;">Nenhum recebedor Pagar.me cadastrado ainda.</p>';

    const emailInput = document.getElementById('recipientEmail');
    if (!emailInput.value && tenant.business_email) {
        emailInput.value = tenant.business_email;
    }

    const siteInput = document.getElementById('recipientSiteUrl');
    if (!siteInput.value && tenant.subdomain) {
        siteInput.value = `https://${tenant.subdomain}.vaiagenda.com.br`;
    }
}

async function atualizarStatusRecipient() {
    const resultado = await getPagarmeRecipient();
    if (!resultado || !resultado.success || !resultado.recipient) return;
    const el = document.getElementById('recipientStatusText');
    if (el) el.textContent = resultado.recipient.status || 'desconhecido';
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, function (char) {
        return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;',"\"":'&quot;'}[char];
    });
}

formPagarmeRecipient.addEventListener('submit', async function (event) {
    event.preventDefault();

    const msg = document.getElementById('mensagemRecipient');
    const btn = document.getElementById('btnCriarRecipient');
    const pj = recipientType.value === 'corporation';

    msg.textContent = 'Enviando cadastro ao Pagar.me...';
    msg.style.color = '#333';
    btn.disabled = true;

    const data = {
        type: recipientType.value,
        email: document.getElementById('recipientEmail').value.trim(),
        site_url: document.getElementById('recipientSiteUrl').value.trim(),
        document: document.getElementById('recipientDocument').value,
        address: {
            street: document.getElementById('recipientStreet').value.trim(),
            complementary: document.getElementById('recipientComplementary').value.trim(),
            street_number: document.getElementById('recipientStreetNumber').value.trim(),
            neighborhood: document.getElementById('recipientNeighborhood').value.trim(),
            city: document.getElementById('recipientCity').value.trim(),
            state: document.getElementById('recipientState').value.trim().toUpperCase(),
            zip_code: document.getElementById('recipientZip').value,
            reference_point: document.getElementById('recipientReference').value.trim(),
        },
        phone_ddd: document.getElementById('recipientDdd').value,
        phone_number: document.getElementById('recipientPhone').value,
        bank: {
            holder_name: document.getElementById('bankHolderName').value.trim(),
            holder_document: document.getElementById('recipientDocument').value,
            bank: document.getElementById('bankCode').value,
            branch_number: document.getElementById('bankBranch').value,
            branch_check_digit: document.getElementById('bankBranchDigit').value,
            account_number: document.getElementById('bankAccount').value,
            account_check_digit: document.getElementById('bankAccountDigit').value,
            type: document.getElementById('bankType').value,
        }
    };

    if (pj) {
        data.company_name = document.getElementById('recipientCompanyName').value.trim();
        data.trading_name = document.getElementById('recipientTradingName').value.trim();
        data.annual_revenue = document.getElementById('recipientAnnualRevenue').value;
        data.corporation_type = document.getElementById('recipientCorporationType').value.trim();
        data.founding_date = document.getElementById('recipientFoundingDate').value;
        data.managing_partner = {
            name: document.getElementById('partnerName').value.trim(),
            email: document.getElementById('partnerEmail').value.trim(),
            document: document.getElementById('partnerDocument').value,
            mother_name: document.getElementById('partnerMotherName').value.trim(),
            birthdate: document.getElementById('partnerBirthdate').value,
            monthly_income: document.getElementById('partnerIncome').value,
            professional_occupation: document.getElementById('partnerOccupation').value.trim(),
            phone_ddd: document.getElementById('recipientDdd').value,
            phone_number: document.getElementById('recipientPhone').value,
            address: { ...data.address }
        };
    } else {
        data.name = document.getElementById('recipientName').value.trim();
        data.mother_name = document.getElementById('recipientMotherName').value.trim();
        data.birthdate = document.getElementById('recipientBirthdate').value;
        data.monthly_income = document.getElementById('recipientMonthlyIncome').value;
        data.professional_occupation = document.getElementById('recipientOccupation').value.trim();
    }

    const resultado = await createPagarmeRecipient(data);

    if (resultado && resultado.success) {
        msg.textContent = resultado.message || 'Recebedor cadastrado com sucesso.';
        msg.style.color = 'green';

        const dados = await getMe();
        if (dados && dados.success) {
            renderPagarmeRecipient(dados.tenant);
        }
    } else {
        msg.textContent = (resultado && resultado.error) || 'Não foi possível cadastrar o recebedor.';
        msg.style.color = 'red';
    }

    btn.disabled = false;
});

/*
==================================================
LOGOTIPO DA LOJA
==================================================
*/

function renderLogo(tenant) {
    if (tenant.logo_url) {
        previewLogo.src = tenant.logo_url;
        previewLogo.style.display = 'block';
        //const topoLogoImg = document.getElementById('topoLogoImg');
        //topoLogoImg.src = tenant.logo_url;
    } else {
        previewLogo.style.display = 'none';
    }
}

formLogo.addEventListener('submit', async function (event) {
    event.preventDefault();
    const msg = document.getElementById('mensagemLogo');
    
    const file = inputLogo.files[0];
    if (!file) return;

    // Validação de limite de 1MB (1 * 1024 * 1024 bytes)
    const maxSize = 1 * 1024 * 1024;
    if (file.size > maxSize) {
        msg.textContent = 'A imagem é muito grande. O limite máximo é 1MB.';
        msg.style.color = 'red';
        return;
    }

    msg.textContent = 'Enviando logo...';
    msg.style.color = '#333';

    // Converte a imagem para Base64 para enviar via JSON na API
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = async function () {
        const base64Image = reader.result;

        try {
            const response = await fetch('/wp-json/agenda/v1/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + getToken()
                },
                body: JSON.stringify({
                    logo: base64Image
                })
            });

            const resultado = await response.json();

            if (resultado && resultado.success) {
                msg.textContent = 'Logo atualizada com sucesso!';
                msg.style.color = 'green';
                
                // Atualiza a pré-visualização na hora sem precisar dar F5
                if (resultado.logo_url) {
                    previewLogo.src = resultado.logo_url;
                    previewLogo.style.display = 'block';
                    // topoLogoImg.src = resultado.logo_url;
                }

                formLogo.reset();
                setTimeout(() => { msg.textContent = ''; }, 3000);
            } else {
                msg.textContent = (resultado && resultado.error) || 'Erro ao enviar logo.';
                msg.style.color = 'red';
            }
        } catch (erro) {
            msg.textContent = 'Falha na conexão.';
            msg.style.color = 'red';
        }
    };

    reader.onerror = function () {
        msg.textContent = 'Erro ao ler o arquivo de imagem.';
        msg.style.color = 'red';
    };
});

/*
==================================================
CONTATO E REDES SOCIAIS (WHATSAPP / INSTAGRAM)
==================================================
*/


function renderContato(tenant) {
    document.getElementById('inputWhatsapp').value = tenant.whatsapp_phone || '';
    document.getElementById('inputInstagram').value = tenant.instagram || '';
    document.getElementById('inputEndereco').value = tenant.address || '';
    carregarConfiguracaoWhatsapp();
}

async function carregarConfiguracaoWhatsapp() {
    const form = document.getElementById('formWhatsappMeta');
    if (!form) return;

    try {
        const response = await fetch('/wp-json/agenda/v1/whatsapp', {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + getToken() }
        });
        const resultado = await response.json();
        const status = document.getElementById('statusWhatsappMeta');
        const areaTeste = document.getElementById('testeWhatsappMeta');

        if (resultado && resultado.success && resultado.connected && resultado.whatsapp) {
            const w = resultado.whatsapp;
            document.getElementById('inputWabaPhoneNumberId').value = w.phone_number_id || '';
            document.getElementById('inputWabaBusinessAccountId').value = w.business_account_id || '';
            document.getElementById('inputWabaDisplayPhone').value = w.display_phone_number || '';
            document.getElementById('inputWabaVerifiedName').value = w.verified_name || '';
            status.textContent = 'Conectado';
            status.style.color = 'green';
            areaTeste.style.display = '';
        } else {
            status.textContent = 'Não conectado';
            status.style.color = '#777';
            areaTeste.style.display = 'none';
        }
    } catch (e) {
        const status = document.getElementById('statusWhatsappMeta');
        status.textContent = 'Não foi possível consultar a conexão.';
        status.style.color = 'red';
    }
}

document.getElementById('formWhatsappMeta').addEventListener('submit', async function (event) {
    event.preventDefault();

    const status = document.getElementById('statusWhatsappMeta');
    status.textContent = 'Salvando...';
    status.style.color = '#333';

    const body = {
        phone_number_id: document.getElementById('inputWabaPhoneNumberId').value.trim(),
        business_account_id: document.getElementById('inputWabaBusinessAccountId').value.trim(),
        access_token: document.getElementById('inputWabaAccessToken').value.trim(),
        display_phone_number: document.getElementById('inputWabaDisplayPhone').value.trim(),
        verified_name: document.getElementById('inputWabaVerifiedName').value.trim()
    };

    try {
        const response = await fetch('/wp-json/agenda/v1/whatsapp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getToken()
            },
            body: JSON.stringify(body)
        });

        const resultado = await response.json();

        if (response.ok && resultado && resultado.success) {
            status.textContent = 'Conexão salva com sucesso!';
            status.style.color = 'green';
            document.getElementById('inputWabaAccessToken').value = '';
            document.getElementById('testeWhatsappMeta').style.display = '';
        } else {
            status.textContent = resultado.message || resultado.code || 'Erro ao salvar a conexão.';
            status.style.color = 'red';
        }
    } catch (e) {
        status.textContent = 'Falha na conexão com o servidor.';
        status.style.color = 'red';
    }
});

document.getElementById('btnTestarWhatsapp').addEventListener('click', async function () {
    const msg = document.getElementById('mensagemTesteWhatsapp');
    const recipient = document.getElementById('inputWhatsappTeste').value.trim();

    if (!recipient) {
        msg.textContent = 'Informe o número que receberá o teste.';
        msg.style.color = 'red';
        return;
    }

    msg.textContent = 'Enviando...';
    msg.style.color = '#333';

    try {
        const response = await fetch('/wp-json/agenda/v1/whatsapp/test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getToken()
            },
            body: JSON.stringify({ recipient_phone: recipient })
        });

        const resultado = await response.json();

        if (response.ok && resultado && resultado.success) {
            msg.textContent = 'Teste enviado! Verifique o WhatsApp.';
            msg.style.color = 'green';
        } else {
            msg.textContent = resultado.message || resultado.code || 'A Meta recusou o envio.';
            msg.style.color = 'red';
            console.error('WhatsApp test:', resultado);
        }
    } catch (e) {
        msg.textContent = 'Falha na conexão com o servidor.';
        msg.style.color = 'red';
    }
});

document.getElementById('btnDesconectarWhatsapp').addEventListener('click', async function () {
    if (!confirm('Desconectar o WhatsApp deste estabelecimento?')) return;

    const msg = document.getElementById('mensagemTesteWhatsapp');
    msg.textContent = 'Desconectando...';
    msg.style.color = '#333';

    try {
        const response = await fetch('/wp-json/agenda/v1/whatsapp', {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + getToken() }
        });

        const resultado = await response.json();

        if (response.ok && resultado && resultado.success) {
            document.getElementById('inputWabaAccessToken').value = '';
            document.getElementById('testeWhatsappMeta').style.display = 'none';
            document.getElementById('statusWhatsappMeta').textContent = 'Não conectado';
            document.getElementById('statusWhatsappMeta').style.color = '#777';
            msg.textContent = 'WhatsApp desconectado.';
            msg.style.color = 'green';
        } else {
            msg.textContent = resultado.message || 'Erro ao desconectar.';
            msg.style.color = 'red';
        }
    } catch (e) {
        msg.textContent = 'Falha na conexão com o servidor.';
        msg.style.color = 'red';
    }
});

const formContato = document.getElementById('formContato');
formContato.addEventListener('submit', async function (event) {
    event.preventDefault();
    const msg = document.getElementById('mensagemContato');
    
    msg.textContent = 'Salvando...';
    msg.style.color = '#333';

    const whatsapp = document.getElementById('inputWhatsapp').value.trim();
    const instagram = document.getElementById('inputInstagram').value.trim();
    const endereco = document.getElementById('inputEndereco').value.trim();

    try {
        const response = await fetch('/wp-json/agenda/v1/me', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getToken()
            },
            body: JSON.stringify({
                whatsapp_phone: whatsapp,
                instagram: instagram,
                address: endereco
            })
        });

        const resultado = await response.json();

        if (resultado && resultado.success) {
            msg.textContent = 'Salvo com sucesso!';
            msg.style.color = 'green';
            setTimeout(() => { msg.textContent = ''; }, 3000);
        } else {
            msg.textContent = (resultado && resultado.error) || 'Erro ao salvar.';
            msg.style.color = 'red';
        }
    } catch (erro) {
        msg.textContent = 'Falha na conexão.';
        msg.style.color = 'red';
    }
});

/*
==================================================
CONFIGURAÇÕES & HORÁRIOS DA LOJA
==================================================
*/

function renderConfiguracoes(tenant) {
    const select = document.getElementById('slotInterval');
    const checkbox = document.getElementById('allowCrossServiceOverlap');

    if (tenant.slot_interval_minutes) {
        select.value = tenant.slot_interval_minutes;
    }

    checkbox.checked = Number(tenant.allow_cross_service_overlap) === 1;
}

function renderFormularioHorarios(horarios) {
    if (!horarios) horarios = [];

    const diasDaSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    let html = '';

    for (let i = 0; i <= 6; i++) {
        const h = horarios.find(item => Number(item.day_of_week) === i) || { opens_at: '08:00', closes_at: '18:00', closed: 0 };
        
        const abre = h.opens_at ? h.opens_at.substring(0, 5) : '08:00';
        const fecha = h.closes_at ? h.closes_at.substring(0, 5) : '18:00';
        const isClosed = Number(h.closed) === 1;

        html += `
            <div style="display: flex; align-items: center; justify-content: space-around; padding: 8px 0; border-bottom: 1px solid #ddd; gap: 10px; flex-wrap: wrap;" data-day="${i}">
                <strong style="width: 130px;">${diasDaSemana[i]}</strong>
                <div style="display: flex; align-items: center; gap: 5px;">
                    <label>Das</label>
                    <input type="time" class="input-abre" value="${abre}" ${isClosed ? 'disabled' : ''} style="padding: 4px;">
                    <label>às</label>
                    <input type="time" class="input-fecha" value="${fecha}" ${isClosed ? 'disabled' : ''} style="padding: 4px;">
                </div>
                <div>
                    <label style="cursor: pointer; font-size: 14px;">
                        <input type="checkbox" class="check-fechado" ${isClosed ? 'checked' : ''}> Fechado
                    </label>
                </div>
            </div>
        `;
    }

    containerDiasHorarios.innerHTML = html;

    containerDiasHorarios.querySelectorAll('.check-fechado').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const row = this.closest('div[data-day]');
            const inputs = row.querySelectorAll('input[type="time"]');
            inputs.forEach(input => input.disabled = this.checked);
        });
    });
}

// Salvar Intervalo
formConfiguracoes.addEventListener('submit', async function (event) {
    event.preventDefault();
    
    const msg = document.getElementById('mensagemConfiguracoes');
    msg.textContent = 'Salvando...';
    msg.style.color = '#333';

    const novoIntervalo = Number(document.getElementById('slotInterval').value);

    try {
        const response = await fetch('/wp-json/agenda/v1/me', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getToken()
            },
            body: JSON.stringify({
                slot_interval_minutes: novoIntervalo,
                allow_cross_service_overlap: document.getElementById('allowCrossServiceOverlap').checked ? 1 : 0
            })
        });

        const resultado = await response.json();

        if (resultado && resultado.success) {
            msg.textContent = 'Salvo com sucesso!';
            msg.style.color = 'green';
            setTimeout(() => { msg.textContent = ''; }, 3000);
        } else {
            msg.textContent = (resultado && resultado.error) || 'Erro ao salvar.';
            msg.style.color = 'red';
        }
    } catch (erro) {
        msg.textContent = 'Falha na conexão.';
        msg.style.color = 'red';
    }
});

// Salvar Horários de Funcionamento
formHorariosFuncionamento.addEventListener('submit', async function (event) {
    event.preventDefault();

    const msg = document.getElementById('mensagemHorarios');
    msg.textContent = 'Salvando...';
    msg.style.color = '#333';

    const businessHours = [];
    const rows = containerDiasHorarios.querySelectorAll('div[data-day]');

    rows.forEach(row => {
        const dayOfWeek = Number(row.getAttribute('data-day'));
        const isClosed = row.querySelector('.check-fechado').checked;
        const opensAt = row.querySelector('.input-abre').value;
        const closesAt = row.querySelector('.input-fecha').value;

        businessHours.push({
            day_of_week: dayOfWeek,
            opens_at: opensAt ? opensAt + ':00' : '08:00:00',
            closes_at: closesAt ? closesAt + ':00' : '18:00:00',
            closed: isClosed ? 1 : 0
        });
    });

    try {
        // CORRIGIDO PARA A ROTA ESPECÍFICA DE BUSINESS-HOURS E CHAVE 'hours'
        const response = await fetch('/wp-json/agenda/v1/me/business-hours', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getToken()
            },
            body: JSON.stringify({
                hours: businessHours
            })
        });

        const resultado = await response.json();

        if (resultado && resultado.success) {
            msg.textContent = 'Horários salvos com sucesso!';
            msg.style.color = 'green';
            setTimeout(() => { msg.textContent = ''; }, 3000);
        } else {
            msg.textContent = (resultado && resultado.error) || 'Erro ao salvar horários.';
            msg.style.color = 'red';
        }
    } catch (erro) {
        msg.textContent = 'Falha na conexão.';
        msg.style.color = 'red';
    }
});


/*
==================================================
RETORNO DO GOOGLE (?google=connected|error na URL)
==================================================
*/

(function tratarRetornoGoogle() {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('google');

    if (!status) return;

    if (status === 'connected') {
        mensagemLogin.textContent = ''; 
    }

    const urlLimpa = window.location.pathname;
    window.history.replaceState({}, '', urlLimpa);

    window.__agendaGoogleRetorno = {
        status: status,
        mensagem: params.get('google_message'),
    };
})();


/*
==================================================
LOGIN
==================================================
*/

formLogin.addEventListener('submit', async function (event) {
    event.preventDefault();
    mensagemLogin.textContent = 'Entrando...';

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    const resultado = await login(email, senha);

    if (resultado && resultado.success) {
        mensagemLogin.textContent = '';
        formLogin.reset();

        const dados = await getMe();
        if (dados && dados.success) {
            mostrarPainel(dados.tenant);
        }
    } else {
        mensagemLogin.textContent = (resultado && resultado.error) || 'Não foi possível entrar.';
    }
});


btnLogout.addEventListener('click', function () {
    logout();
});


/*
==================================================
STATUS DA ASSINATURA
==================================================
*/

function renderStatusAssinatura(subscription) {
    if (!subscription) {
        statusAssinatura.innerHTML = '<p>Nenhuma assinatura encontrada.</p>';
        renderAcoesConta(null);
        return;
    }

    const rotulos = {
        trial: 'Período de teste',
        active: 'Ativa',
        past_due: 'Pagamento pendente',
        canceled: 'Cancelada',
        ended: 'Encerrada',
    };

    const mostraValidade = ['trial', 'active', 'past_due'].includes(subscription.status);
    const canceladaNoFim = Number(subscription.cancel_at_period_end) === 1;

    let html = `
        <p>
            Plano: <strong>${subscription.plan_name || '-'}</strong><br>
            Status: <strong>${rotulos[subscription.status] || subscription.status}</strong><br>
            ${mostraValidade && subscription.current_period_end ? 'Válido até: ' + subscription.current_period_end : ''}
        </p>
    `;

    if (canceladaNoFim) {
        html += `
            <p style="color:#a15c00; font-weight:bold;">
                Cancelamento programado: sua assinatura não será renovada.
                O acesso continua até ${subscription.current_period_end || 'o fim do período atual'}.
            </p>
        `;
    }

    if (subscription.status === 'past_due') {
        html += `
            <p style="color:#b00;">Sua assinatura está com pagamento pendente. Os clientes não conseguem mais agendar até a regularização.</p>
            <button type="button" id="btnPagarAgora" class="primario">Pagar agora</button>
        `;
    }

    statusAssinatura.innerHTML = html;

    const btnPagar = document.getElementById('btnPagarAgora');
    if (btnPagar) {
        btnPagar.addEventListener('click', async function () {
            btnPagar.disabled = true;
            btnPagar.textContent = 'Gerando link...';

            const resultado = await getPaymentLink();

            if (resultado && resultado.success && resultado.checkout_url) {
                window.location.href = resultado.checkout_url;
            } else {
                alert((resultado && resultado.error) || 'Não foi possível gerar o link de pagamento.');
                btnPagar.disabled = false;
                btnPagar.textContent = 'Pagar agora';
            }
        });
    }

    renderAcoesConta(subscription);
}

function renderAcoesConta(subscription) {
    if (!acoesConta) return;

    mensagemAcoesConta.textContent = '';
    mensagemAcoesConta.style.color = '';

    const canceladaNoFim = subscription && Number(subscription.cancel_at_period_end) === 1;
    const assinaturaAtiva = subscription && ['trial', 'active', 'past_due'].includes(subscription.status);

    btnCancelarAssinatura.style.display = assinaturaAtiva && !canceladaNoFim ? 'inline-block' : 'none';
    btnExcluirConta.style.display = 'inline-block';
}

btnCancelarAssinatura.addEventListener('click', async function () {
    if (!confirm('Deseja realmente cancelar sua assinatura? Ela não será renovada, mas continuará disponível até o fim do período atual.')) {
        return;
    }

    btnCancelarAssinatura.disabled = true;
    btnCancelarAssinatura.textContent = 'Cancelando...';
    mensagemAcoesConta.textContent = 'Processando cancelamento...';
    mensagemAcoesConta.style.color = '#a15c00';

    try {
        const response = await fetch('/wp-json/agenda/v1/me/subscription/cancel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getToken()
            },
            body: JSON.stringify({})
        });

        const resultado = await response.json();

        if (resultado && resultado.success) {
            mensagemAcoesConta.textContent = resultado.message || 'Assinatura cancelada com sucesso.';
            mensagemAcoesConta.style.color = 'green';

            const dados = await getMe();
            if (dados && dados.success) {
                mostrarPainel(dados.tenant);
            }
        } else {
            mensagemAcoesConta.textContent = (resultado && resultado.error) || 'Não foi possível cancelar a assinatura.';
            mensagemAcoesConta.style.color = 'red';
            btnCancelarAssinatura.disabled = false;
            btnCancelarAssinatura.textContent = 'Cancelar assinatura';
        }
    } catch (e) {
        mensagemAcoesConta.textContent = 'Falha na comunicação com o servidor.';
        mensagemAcoesConta.style.color = 'red';
        btnCancelarAssinatura.disabled = false;
        btnCancelarAssinatura.textContent = 'Cancelar assinatura';
    }
});

btnExcluirConta.addEventListener('click', async function () {
    const primeiraConfirmacao = confirm(
        'ATENÇÃO! O cancelamento definitivo encerrará sua conta e removerá os dados do seu negócio.\\n\\n' +
        'Essa ação não poderá ser desfeita. Deseja continuar?'
    );

    if (!primeiraConfirmacao) return;

    const confirmacaoTexto = prompt('Para confirmar, digite exatamente: EXCLUIR CONTA');
    if (confirmacaoTexto !== 'EXCLUIR CONTA') {
        alert('Cancelamento não confirmado. Nenhuma alteração foi feita.');
        return;
    }

    btnExcluirConta.disabled = true;
    btnExcluirConta.textContent = 'Encerrando conta...';
    mensagemAcoesConta.textContent = 'Processando encerramento definitivo...';
    mensagemAcoesConta.style.color = '#b00';

    try {
        const response = await fetch('/wp-json/agenda/v1/me/account/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getToken()
            },
            body: JSON.stringify({ confirmation: 'EXCLUIR CONTA' })
        });

        const resultado = await response.json();

        if (resultado && resultado.success) {
            localStorage.removeItem('agenda_token');
            alert('Sua conta foi encerrada definitivamente. Um e-mail de confirmação foi enviado.');
            window.location.reload();
            return;
        }

        mensagemAcoesConta.textContent = (resultado && resultado.error) || 'Não foi possível encerrar a conta.';
        mensagemAcoesConta.style.color = 'red';
        btnExcluirConta.disabled = false;
        btnExcluirConta.textContent = 'Cancelar conta definitivamente';
    } catch (e) {
        mensagemAcoesConta.textContent = 'Falha na comunicação com o servidor.';
        mensagemAcoesConta.style.color = 'red';
        btnExcluirConta.disabled = false;
        btnExcluirConta.textContent = 'Cancelar conta definitivamente';
    }
});

/*
==================================================
GOOGLE AGENDA
==================================================
*/

async function renderStatusGoogle() {
    const resultado = await getGoogleStatus();
    const retorno = window.__agendaGoogleRetorno;
    let banner = '';

    if (retorno && retorno.status === 'connected') {
        banner = '<p style="color:green;">Google Agenda conectada com sucesso!</p>';
    } else if (retorno && retorno.status === 'error') {
        banner = `<p style="color:red;">${retorno.mensagem || 'Não foi possível conectar com o Google.'}</p>`;
    }

    window.__agendaGoogleRetorno = null; 

    if (!resultado || !resultado.success) {
        statusGoogle.innerHTML = banner + '<p>Não foi possível verificar o status.</p>';
        return;
    }

    if (resultado.connected) {
        statusGoogle.innerHTML = `
            ${banner}
            <p>Conectada — seus agendamentos aparecem automaticamente na sua Google Agenda.</p>
            <button type="button" id="btnDesconectarGoogle" class="secundario">Desconectar</button>
        `;

        document.getElementById('btnDesconectarGoogle').addEventListener('click', async function () {
            if (!confirm('Desconectar sua Google Agenda? Agendamentos futuros vão parar de aparecer nela.')) {
                return;
            }
            await disconnectGoogle();
            renderStatusGoogle();
        });

    } else {
        statusGoogle.innerHTML = `
            ${banner}
            <p>Sua Google Agenda ainda não está conectada.</p>
            <button type="button" id="btnConectarGoogle" class="primario">Conectar Google Agenda</button>
        `;

        document.getElementById('btnConectarGoogle').addEventListener('click', connectGoogle);
    }
}


/*
==================================================
SERVIÇOS
==================================================
*/

function renderServicos(servicos) {
    listaServicos.innerHTML = '';

    if (!servicos || servicos.length === 0) {
        listaServicos.innerHTML = '<p>Nenhum serviço cadastrado ainda.</p>';
        return;
    }

    servicos.forEach(function (servico) {
        const linha = document.createElement('div');

        linha.innerHTML = `
            <span style="display:inline-block; margin-bottom:10px;">${servico.name} — ${servico.duration_minutes}min — R$ ${servico.price} — Capacidade até ${servico.capacity} vaga(s)${Number(servico.payment_required) === 1 ? ' — 💳 pagamento obrigatório' : ''}</span>
            <button type="button" data-id="${servico.id}" class="secundario btnRemoverServico" style="margin-left: 10px; padding: 5px 10px;">Remover</button>
        `;

        listaServicos.appendChild(linha);
    });

    document.querySelectorAll('.btnRemoverServico').forEach(function (botao) {
        botao.addEventListener('click', async function () {
            const id = this.getAttribute('data-id');
            await deleteMyService(id);

            const dados = await listMyServices();
            if (dados && dados.success) {
                renderServicos(dados.services);
            }
        });
    });
}


formNovoServico.addEventListener('submit', async function (event) {
    event.preventDefault();

    const novoServico = {
        name: document.getElementById('novoNome',).value,
        duration_minutes: Number(document.getElementById('novaDuracao').value),
        price: Number(document.getElementById('novoPreco').value.replace(',', '.')),
        capacity: Number(document.getElementById('novoCapacidade').value.replace(',', '.')),
        payment_required: document.getElementById('novoPagamentoObrigatorio').checked
    };

    const resultado = await createMyService(novoServico);

    if (resultado && resultado.success) {
        formNovoServico.reset();

        const dados = await listMyServices();
        if (dados && dados.success) {
            renderServicos(dados.services);
        }
    } else {
        alert((resultado && resultado.error) || 'Erro ao adicionar serviço.');
    }
});

        /*
==================================================
AGENDAMENTOS DO TENANT
==================================================
*/

async function carregarAgendamentos() {
    const container = document.getElementById('listaAgendamentos');
    container.innerHTML = '<p>Carregando agendamentos...</p>';

    try {
        const response = await fetch('/wp-json/agenda/v1/me/appointments', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + getToken()
            }
        });

        const resultado = await response.json();

        if (resultado && resultado.success) {
            renderAgendamentos(resultado.appointments);
        } else {
            container.innerHTML = '<p>Erro ao carregar agendamentos.</p>';
        }
    } catch (erro) {
        container.innerHTML = '<p>Falha na conexão com o servidor.</p>';
    }
}

function renderAgendamentos(appointments) {
    const container = document.getElementById('listaAgendamentos');
    container.innerHTML = '';

    if (!appointments || appointments.length === 0) {
        container.innerHTML = '<p>Nenhum agendamento futuro encontrado.</p>';
        return;
    }

    appointments.forEach(function (app) {
        const linha = document.createElement('div');
        linha.style.css = 'background: #fff; padding: 10px; margin-bottom: 10px; border-radius: 4px; border: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;';
        
        linha.innerHTML = `
            <div>
                <strong>${app.customer_name}</strong> (${app.customer_phone})<br>
                <span>Serviço: <strong>${app.service_name || 'Geral'}</strong></span><br>
                <span>Data: <strong>${app.appointment_date}</strong> às <strong>${app.start_time.substring(0,5)}</strong></span>
            </div>
            <div>
                <button type="button" data-id="${app.id}" class="secundario btnCancelarAgendamento" style="background: #ff4d4d; color: #fff; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Cancelar</button>
            </div>
        `;

        container.appendChild(linha);
    });

    // Adiciona o evento de clique para o botão de cancelar
    container.querySelectorAll('.btnCancelarAgendamento').forEach(function (botao) {
        botao.addEventListener('click', async function () {
            if (!confirm('Deseja realmente cancelar este agendamento?')) return;

            const id = this.getAttribute('data-id');
            const sucesso = await cancelarAgendamento(id);

            if (sucesso) {
                carregarAgendamentos(); // Recarrega a lista após cancelar
            } else {
                alert('Erro ao cancelar o agendamento.');
            }
        });
    });
}

async function cancelarAgendamento(id) {
    try {
        const response = await fetch(`/wp-json/agenda/v1/me/appointments/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + getToken()
            }
        });
        const resultado = await response.json();
        return resultado && resultado.success;
    } catch (e) {
        return false;
    }
}

const formBloquearData = document.getElementById('formBloquearData');
const listaDatasBloqueadas = document.getElementById('listaDatasBloqueadas');

async function carregarDatasBloqueadas() {
    listaDatasBloqueadas.innerHTML = '<p>Carregando...</p>';
    const resultado = await getBlockedDates();
    renderDatasBloqueadas(resultado && resultado.success ? resultado.blocked_dates : []);
}

function renderDatasBloqueadas(itens) {
    if (!itens || itens.length === 0) {
    listaDatasBloqueadas.innerHTML = '<p>Nenhuma data bloqueada.</p>';
    return;
}

listaDatasBloqueadas.innerHTML = '';

itens.forEach(function (item) {
    const linha = document.createElement('div');

    const origemLabel = item.source === 'google'
        ? ' (Google Agenda)'
        : '';

    // Data
    let dataFormatada = item.date || item.blocked_date || '-';

    if (dataFormatada !== '-') {
        const partes = dataFormatada.split('-');

        if (partes.length === 3) {
            dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;
        }
    }

    // Horário/faixa de bloqueio
    const faixaHorario =
        item.time_range ||
        item.time ||
        item.hours ||
        'Dia inteiro';

    // Motivo
    const motivo = item.reason
        ? `<br><small>${item.reason}</small>`
        : '';

    linha.style.cssText =
        'display:flex; justify-content:space-between; align-items:center; background:#fff; padding:8px 10px; margin-bottom:6px; border-radius:4px; border:1px solid #ddd;';

    linha.innerHTML = `
        <span>
            <strong>${dataFormatada}</strong>
            — ${faixaHorario}${origemLabel}
            ${motivo}
        </span>

        <button
            type="button"
            class="secundario btnRemoverBloqueio"
            style="padding:4px 10px;"
        >
            Desbloquear
        </button>
    `;

    linha.querySelector('.btnRemoverBloqueio')
        .addEventListener('click', async function () {

            const resultado = await removeBlockedDate(item);

            if (resultado && resultado.success === false) {
                alert(resultado.error || 'Não foi possível desbloquear a data.');
                return;
            }

            carregarDatasBloqueadas();
        });

    listaDatasBloqueadas.appendChild(linha);
});
}

formBloquearData.addEventListener('submit', async function (event) {
    event.preventDefault();
    const msg = document.getElementById('mensagemBloqueio');
    const data = document.getElementById('dataBloqueio').value;
    const motivo = document.getElementById('motivoBloqueio').value;

    msg.textContent = 'Bloqueando...';
    msg.style.color = '#333';

    const resultado = await addBlockedDate(data, motivo);

    if (resultado && resultado.success) {
        msg.textContent = '';
        formBloquearData.reset();
        carregarDatasBloqueadas();
    } else {
        msg.textContent = (resultado && resultado.error) || 'Erro ao bloquear data.';
        msg.style.color = 'red';
    }
});

/* ==================================================
   DESTAQUES DA PÁGINA DO TENANT
================================================== */

function renderDestaques(tenant) {

    const inputPhrase2Title = document.getElementById('inputPhrase2Title');
    const inputPhrase1 = document.getElementById('inputPhrase1');
    const inputPhrase3 = document.getElementById('inputPhrase3');

    if (!inputPhrase2Title || !inputPhrase1 || !inputPhrase3) {
        return;
    }

    inputPhrase2Title.value = tenant.phrase_2_title || '';
    inputPhrase1.value = tenant.phrase_1 || '';
    inputPhrase3.value = tenant.phrase_3 || '';
}


document.getElementById('btnSalvarDestaques')?.addEventListener('click', async function () {

    const btn = this;

    const mensagem = document.getElementById('mensagemDestaques');

    const phrase2Title =
        document.getElementById('inputPhrase2Title').value.trim();

    const phrase1 =
        document.getElementById('inputPhrase1').value.trim();

    const phrase3 =
        document.getElementById('inputPhrase3').value.trim();


    mensagem.textContent = 'Salvando...';
    mensagem.style.color = '#333';

    btn.disabled = true;


    try {

        const response = await fetch('/wp-json/agenda/v1/me', {

            method: 'PUT',

            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getToken()
            },

            body: JSON.stringify({

                phrase_2_title: phrase2Title,
                phrase_1: phrase1,
                phrase_3: phrase3

            })

        });


        const resultado = await response.json();


        if (response.ok && resultado && resultado.success) {

            mensagem.textContent =
                'Destaques salvos com sucesso!';

            mensagem.style.color = 'green';

        } else {

            mensagem.textContent =
                (resultado && (resultado.error || resultado.message))
                || 'Não foi possível salvar os destaques.';

            mensagem.style.color = 'red';
        }


    } catch (erro) {

        console.error(erro);

        mensagem.textContent =
            'Falha na conexão com o servidor.';

        mensagem.style.color = 'red';

    } finally {

        btn.disabled = false;

    }

});

/* ==================================================
   HIGHLIGHTS DA PÁGINA
   ================================================== */

function renderHighlights(tenant) {

    /*
     * O backend retorna os highlights em:
     *
     * tenant.highlights
     *
     * Formato esperado:
     *
     * [
     *     {
     *         title: "...",
     *         description: "..."
     *     },
     *     ...
     * ]
     */

    const highlights = Array.isArray(tenant.highlights)
        ? tenant.highlights
        : [];


    for (let i = 0; i < 3; i++) {

        const highlight = highlights[i] || {};

        const inputTitle =
            document.getElementById(`highlight${i + 1}Title`);

        const inputDescription =
            document.getElementById(`highlight${i + 1}Description`);


        if (!inputTitle || !inputDescription) {
            continue;
        }


        inputTitle.value = highlight.title || '';

        inputDescription.value =
            highlight.description || '';
    }
}


/* ==================================================
   SALVAR HIGHLIGHTS
   ================================================== */

document.getElementById('btnSalvarHighlights')?.addEventListener(
    'click',
    async function () {

        const btn = this;

        const mensagem =
            document.getElementById('mensagemHighlights');


        const highlights = [];


        for (let i = 1; i <= 3; i++) {

            const title =
                document
                    .getElementById(`highlight${i}Title`)
                    .value
                    .trim();

            const description =
                document
                    .getElementById(`highlight${i}Description`)
                    .value
                    .trim();


            /*
             * Se os dois campos estiverem vazios,
             * não adiciona esse highlight.
             */

            if (!title && !description) {
                continue;
            }


            highlights.push({
                title: title,
                description: description
            });
        }


        mensagem.textContent = 'Salvando...';
        mensagem.style.color = '#333';

        btn.disabled = true;


        try {

            /*
             * Usa a função que já existe no seu api.js:
             *
             * updateMyHighlights(highlights)
             */

            const resultado =
                await updateMyHighlights(highlights);


            if (resultado && resultado.success) {

                mensagem.textContent =
                    'Highlights salvos com sucesso!';

                mensagem.style.color = 'green';


            } else {

                mensagem.textContent =
                    (resultado &&
                    (resultado.error || resultado.message))
                    ||
                    'Não foi possível salvar os highlights.';

                mensagem.style.color = 'red';
            }


        } catch (erro) {

            console.error(erro);

            mensagem.textContent =
                'Falha na conexão com o servidor.';

            mensagem.style.color = 'red';


        } finally {

            btn.disabled = false;

        }

    }
);

function renderTemplateImage(tenant) {

    if (!previewTemplateImage) {
        return;
    }

    if (tenant.template_image_url) {

        previewTemplateImage.src =
            tenant.template_image_url;

        previewTemplateImage.style.display = 'block';

    } else {

        previewTemplateImage.src = '';

        previewTemplateImage.style.display = 'none';
    }
}

formTemplateImage.addEventListener(
    'submit',
    async function (event) {

        event.preventDefault();

        const msg =
            document.getElementById(
                'mensagemTemplateImage'
            );

        const file =
            inputTemplateImage.files[0];

        if (!file) {

            msg.textContent =
                'Selecione uma imagem.';

            msg.style.color = 'red';

            return;
        }

        /*
        --------------------------------------------------
        Limite de 1MB
        --------------------------------------------------
        */

        const maxSize =
            1 * 1024 * 1024;

        if (file.size > maxSize) {

            msg.textContent =
                'A imagem é muito grande. O limite máximo é 1MB.';

            msg.style.color = 'red';

            return;
        }

        /*
        --------------------------------------------------
        Formato
        --------------------------------------------------
        */

        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp'
        ];

        if (!allowedTypes.includes(file.type)) {

            msg.textContent =
                'Formato inválido. Use JPG, PNG ou WEBP.';

            msg.style.color = 'red';

            return;
        }

        msg.textContent =
            'Enviando imagem...';

        msg.style.color = '#333';

        const reader = new FileReader();

        reader.readAsDataURL(file);

        reader.onload = async function () {

            try {

                const resultado =
                    await updateMe({

                        template_image:
                            reader.result

                    });

                if (
                    resultado &&
                    resultado.success
                ) {

                    msg.textContent =
                        'Imagem atualizada com sucesso!';

                    msg.style.color =
                        'green';

                    if (
                        resultado.template_image_url
                    ) {

                        previewTemplateImage.src =
                            resultado.template_image_url;

                        previewTemplateImage.style.display =
                            'block';
                    }

                    formTemplateImage.reset();

                    setTimeout(
                        () => {
                            msg.textContent = '';
                        },
                        3000
                    );

                } else {

                    msg.textContent =
                        (
                            resultado &&
                            resultado.error
                        ) ||
                        'Erro ao enviar imagem.';

                    msg.style.color =
                        'red';
                }

            } catch (erro) {

                console.error(erro);

                msg.textContent =
                    'Falha na conexão.';

                msg.style.color =
                    'red';
            }
        };

        reader.onerror = function () {

            msg.textContent =
                'Erro ao ler o arquivo de imagem.';

            msg.style.color =
                'red';
        };
    }
);

painel-reagendamento:
(function () {
    'use strict';

    function adicionarBotoesReagendar() {
        const container = document.getElementById('listaAgendamentos');
        if (!container) return;

        container.querySelectorAll('.btnCancelarAgendamento').forEach(function (botaoCancelar) {
            const areaBotoes = botaoCancelar.parentElement;
            if (!areaBotoes) return;

            if (areaBotoes.querySelector('.btnReagendarAgendamento')) return;

            const id = botaoCancelar.getAttribute('data-id');
            if (!id) return;

            const botao = document.createElement('button');

            botao.type = 'button';
            botao.className = 'secundario btnReagendarAgendamento';
            botao.setAttribute('data-id', id);
            botao.textContent = 'Reagendar';

            botao.style.cssText =
                'background:#2563eb;' +
                'color:#fff;' +
                'border:none;' +
                'padding:5px 10px;' +
                'border-radius:4px;' +
                'cursor:pointer;' +
                'margin-right:6px;';

            areaBotoes.insertBefore(botao, botaoCancelar);
        });
    }

    function obterDadosDaLinha(botao) {
        const areaBotoes = botao.parentElement;
        const linha = areaBotoes ? areaBotoes.parentElement : null;

        if (!linha) {
            return {
                data: ''
            };
        }

        const texto = linha.textContent || '';

        const match = texto.match(/Data:\s*(\d{4}-\d{2}-\d{2})/);

        return {
            data: match ? match[1] : ''
        };
    }

    async function reagendar(id, botao) {
        const dados = obterDadosDaLinha(botao);

        const novaData = window.prompt(
            'Nova data (AAAA-MM-DD):',
            dados.data
        );

        if (!novaData) return;

        const novoHorario = window.prompt(
            'Novo horário (HH:MM):',
            ''
        );

        if (!novoHorario) return;

        if (!/^\d{4}-\d{2}-\d{2}$/.test(novaData)) {
            window.alert(
                'Data inválida. Use o formato AAAA-MM-DD.'
            );
            return;
        }

        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(novoHorario)) {
            window.alert(
                'Horário inválido. Use o formato HH:MM.'
            );
            return;
        }

        if (!window.confirm(
            'Reagendar para ' +
            novaData +
            ' às ' +
            novoHorario +
            '?'
        )) {
            return;
        }

        const textoOriginal = botao.textContent;

        botao.disabled = true;
        botao.textContent = 'Salvando...';

        try {
            const response = await fetch(
                '/wp-json/agenda/v1/me/appointments/' +
                encodeURIComponent(id),
                {
                    method: 'PUT',

                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + getToken()
                    },

                    body: JSON.stringify({
                        appointment_date: novaData,
                        start_time: novoHorario
                    })
                }
            );

            let resultado = null;

            try {
                resultado = await response.json();
            } catch (e) {
                resultado = null;
            }

            console.log(
                'Resposta do reagendamento:',
                resultado
            );

            /*
             * Reagendamento realizado
             */
            if (
                response.ok &&
                resultado &&
                resultado.success
            ) {

                /*
                 * Verifica o resultado do WhatsApp
                 */
                if (
                    resultado.whatsapp &&
                    resultado.whatsapp.attempted
                ) {

                    if (resultado.whatsapp.success) {

                        window.alert(
                            'Agendamento reagendado com sucesso.\n\n' +
                            'WhatsApp: mensagem enviada com sucesso.'
                        );

                    } else {

                        const erro =
                            resultado.whatsapp.error_message ||
                            'Motivo não informado pela API.';

                        const codigo =
                            resultado.whatsapp.error_code ||
                            'Não informado';

                        const http =
                            resultado.whatsapp.http_code ||
                            'Não informado';

                        window.alert(
                            'Agendamento reagendado com sucesso.\n\n' +
                            '⚠️ WhatsApp NÃO foi enviado.\n\n' +
                            'Motivo: ' + erro + '\n' +
                            'Código: ' + codigo + '\n' +
                            'HTTP: ' + http
                        );
                    }

                } else {

                    window.alert(
                        'Agendamento reagendado com sucesso.\n\n' +
                        '⚠️ O envio do WhatsApp não foi executado.'
                    );
                }

                if (
                    typeof carregarAgendamentos === 'function'
                ) {
                    await carregarAgendamentos();
                }

                return;
            }

            /*
             * Erro no próprio reagendamento
             */
            let mensagemErro =
                'Não foi possível reagendar o agendamento.';

            if (resultado) {

                mensagemErro =
                    resultado.error ||
                    resultado.message ||
                    resultado.data?.message ||
                    mensagemErro;
            }

            window.alert(mensagemErro);

        } catch (erro) {

            console.error(
                'Erro ao reagendar agendamento:',
                erro
            );

            window.alert(
                'Falha na conexão com o servidor.'
            );

        } finally {

            botao.disabled = false;
            botao.textContent = textoOriginal;
        }
    }

    function iniciar() {
        const container =
            document.getElementById('listaAgendamentos');

        if (!container) return;

        adicionarBotoesReagendar();

        const observer =
            new MutationObserver(function () {
                adicionarBotoesReagendar();
            });

        observer.observe(container, {
            childList: true,
            subtree: true
        });

        container.addEventListener(
            'click',
            function (event) {

                const botao =
                    event.target.closest(
                        '.btnReagendarAgendamento'
                    );

                if (!botao) return;

                const id =
                    botao.getAttribute('data-id');

                if (!id) return;

                reagendar(id, botao);
            }
        );
    }

    if (
        document.readyState === 'loading'
    ) {

        document.addEventListener(
            'DOMContentLoaded',
            iniciar
        );

    } else {

        iniciar();
    }

})();

whatsapp.php:
<?php

/**
 * Integração com a WhatsApp Cloud API oficial da Meta.
 *
 * Nesta primeira etapa o arquivo fornece a camada de transporte/configuração.
 * O cadastro via Embedded Signup e os lembretes automáticos serão adicionados
 * em etapas posteriores.
 */

defined('ABSPATH') || exit;

if (!defined('AGENDA_WHATSAPP_GRAPH_VERSION')) {
    // Fixe a versão usada pelo seu projeto e atualize conscientemente quando
    // a Meta exigir uma versão nova.
    define('AGENDA_WHATSAPP_GRAPH_VERSION', 'v23.0');
}

/**
 * Normaliza um número brasileiro/internacional para o formato aceito pela API.
 * A API deve receber apenas dígitos, com código do país.
 */
function agenda_saas_whatsapp_normalize_phone(string $phone): string {
    $phone = preg_replace('/\D+/', '', $phone);

    // Compatibilidade com números brasileiros que ainda estejam salvos sem 55.
    if (strlen($phone) >= 10 && strlen($phone) <= 11 && str_starts_with($phone, '0') === false) {
        $phone = '55' . $phone;
    }

    return $phone;
}

/**
 * Criptografa o access token antes de gravá-lo no banco.
 * Usa as salts do próprio WordPress como material da chave.
 */
function agenda_saas_whatsapp_encrypt_token(string $token): string {

    if ($token === '') {
        return '';
    }

    $key = hash('sha256', wp_salt('auth'), true);
    $iv  = random_bytes(16);

    $encrypted = openssl_encrypt(
        $token,
        'AES-256-CBC',
        $key,
        OPENSSL_RAW_DATA,
        $iv
    );

    if ($encrypted === false) {
        throw new RuntimeException('Não foi possível proteger o token do WhatsApp.');
    }

    return base64_encode($iv . $encrypted);
}

/**
 * Descriptografa o access token armazenado.
 */
function agenda_saas_whatsapp_decrypt_token(string $encrypted): string {

    if ($encrypted === '') {
        return '';
    }

    $raw = base64_decode($encrypted, true);

    if ($raw === false || strlen($raw) <= 16) {
        return '';
    }

    $iv = substr($raw, 0, 16);
    $data = substr($raw, 16);
    $key = hash('sha256', wp_salt('auth'), true);

    $decrypted = openssl_decrypt(
        $data,
        'AES-256-CBC',
        $key,
        OPENSSL_RAW_DATA,
        $iv
    );

    return is_string($decrypted) ? $decrypted : '';
}

/**
 * Busca a configuração do WhatsApp de um tenant.
 * Nunca retorna o token descriptografado para o frontend.
 */
function agenda_saas_whatsapp_get_config(int $tenantId): ?array {

    global $wpdb;

    $table = $wpdb->prefix . 'tenant_whatsapp';

    $config = $wpdb->get_row(
        $wpdb->prepare(
            "SELECT * FROM $table WHERE tenant_id = %d LIMIT 1",
            $tenantId
        ),
        ARRAY_A
    );

    return $config ?: null;
}

/**
 * Salva/atualiza a configuração da Cloud API de um tenant.
 *
 * $data pode conter:
 * - phone_number_id
 * - business_account_id
 * - access_token
 * - display_phone_number
 * - verified_name
 * - status
 */
function agenda_saas_whatsapp_save_config(int $tenantId, array $data): bool {

    global $wpdb;

    $table = $wpdb->prefix . 'tenant_whatsapp';

    $existing = agenda_saas_whatsapp_get_config($tenantId);

    $row = [
        'tenant_id'            => $tenantId,
        'phone_number_id'     => sanitize_text_field((string) ($data['phone_number_id'] ?? '')),
        'business_account_id' => sanitize_text_field((string) ($data['business_account_id'] ?? '')),
        'display_phone_number' => sanitize_text_field((string) ($data['display_phone_number'] ?? '')),
        'verified_name'        => sanitize_text_field((string) ($data['verified_name'] ?? '')),
        'status'              => sanitize_key((string) ($data['status'] ?? 'connected')),
    ];

    if (isset($data['access_token']) && $data['access_token'] !== '') {
        $row['access_token'] = agenda_saas_whatsapp_encrypt_token((string) $data['access_token']);
    }

    if ($existing) {

        // Se não foi enviado um novo token, preserva o existente.
        if (!isset($row['access_token'])) {
            unset($row['access_token']);
        }

        $formats = [];
        foreach ($row as $column => $value) {
            $formats[] = ($column === 'tenant_id') ? '%d' : '%s';
        }

        $result = $wpdb->update(
            $table,
            $row,
            ['tenant_id' => $tenantId],
            $formats,
            ['%d']
        );

        return $result !== false;
    }

    if (empty($row['access_token'])) {
        $row['access_token'] = null;
    }

    $row['connected_at'] = current_time('mysql', true);

    $formats = [
        '%d', '%s', '%s', '%s', '%s', '%s', '%s', '%s'
    ];

    return $wpdb->insert($table, $row, $formats) !== false;
}

/**
 * Remove a conexão do tenant sem apagar o histórico de mensagens.
 */
function agenda_saas_whatsapp_disconnect(int $tenantId): bool {

    global $wpdb;

    $table = $wpdb->prefix . 'tenant_whatsapp';

    return $wpdb->delete(
        $table,
        ['tenant_id' => $tenantId],
        ['%d']
    ) !== false;
}

/**
 * Faz uma chamada POST para o endpoint /messages da Cloud API.
 *
 * Esta função é interna. Para envio use agenda_saas_whatsapp_send_template()
 * ou agenda_saas_whatsapp_send_text() quando a política da Meta permitir.
 */
function agenda_saas_whatsapp_api_request(int $tenantId, array $payload): array {

    $config = agenda_saas_whatsapp_get_config($tenantId);

    if (!$config) {
        return [
            'success' => false,
            'http_code' => 0,
            'error_code' => 'not_configured',
            'error_message' => 'WhatsApp não está configurado para este estabelecimento.',
            'data' => null,
        ];
    }

    $phoneNumberId = trim((string) $config['phone_number_id']);
    $token = agenda_saas_whatsapp_decrypt_token((string) $config['access_token']);

    if ($phoneNumberId === '' || $token === '') {
        return [
            'success' => false,
            'http_code' => 0,
            'error_code' => 'invalid_config',
            'error_message' => 'Phone Number ID ou access token do WhatsApp está ausente.',
            'data' => null,
        ];
    }

    $url = sprintf(
        'https://graph.facebook.com/%s/%s/messages',
        AGENDA_WHATSAPP_GRAPH_VERSION,
        rawurlencode($phoneNumberId)
    );

    $response = wp_remote_post($url, [
        'timeout' => 20,
        'headers' => [
            'Authorization' => 'Bearer ' . $token,
            'Content-Type' => 'application/json',
        ],
        'body' => wp_json_encode($payload),
    ]);

    if (is_wp_error($response)) {
        return [
            'success' => false,
            'http_code' => 0,
            'error_code' => 'http_error',
            'error_message' => $response->get_error_message(),
            'data' => null,
        ];
    }

    $httpCode = (int) wp_remote_retrieve_response_code($response);
    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);

    if (!is_array($data)) {
        $data = ['raw' => $body];
    }

    if ($httpCode < 200 || $httpCode >= 300) {

        $errorCode = '';
        $errorMessage = 'Erro ao comunicar com a API do WhatsApp.';

        if (!empty($data['error']) && is_array($data['error'])) {
            $errorCode = (string) ($data['error']['code'] ?? '');
            $errorMessage = (string) ($data['error']['message'] ?? $errorMessage);
        }

        return [
            'success' => false,
            'http_code' => $httpCode,
            'error_code' => $errorCode ?: 'meta_api_error',
            'error_message' => $errorMessage,
            'data' => $data,
        ];
    }

    return [
        'success' => true,
        'http_code' => $httpCode,
        'error_code' => null,
        'error_message' => null,
        'data' => $data,
    ];
}

/**
 * Envia um template aprovado pela Meta.
 *
 * $components deve seguir a estrutura de components da Cloud API.
 * Exemplo de body gerado:
 * {
 *   messaging_product: 'whatsapp',
 *   to: '5581999999999',
 *   type: 'template',
 *   template: {
 *      name: 'lembrete_agendamento',
 *      language: ['code' => 'pt_BR'],
 *      components: [...]
 *   }
 * }
 */
function agenda_saas_whatsapp_send_template(
    int $tenantId,
    string $recipientPhone,
    string $templateName,
    string $languageCode = 'pt_BR',
    array $components = [],
    ?int $appointmentId = null,
    string $messageType = 'template'
): array {

    $recipientPhone = agenda_saas_whatsapp_normalize_phone($recipientPhone);

    if ($recipientPhone === '') {
        return [
            'success' => false,
            'error_code' => 'invalid_phone',
            'error_message' => 'Número de WhatsApp do cliente inválido.',
        ];
    }

    $payload = [
        'messaging_product' => 'whatsapp',
        'recipient_type' => 'individual',
        'to' => $recipientPhone,
        'type' => 'template',
        'template' => [
            'name' => sanitize_key($templateName),
            'language' => [
                'code' => sanitize_text_field($languageCode),
            ],
        ],
    ];

    if (!empty($components)) {
        $payload['template']['components'] = $components;
    }

    $result = agenda_saas_whatsapp_api_request($tenantId, $payload);

    agenda_saas_whatsapp_log_message(
        $tenantId,
        $appointmentId,
        $recipientPhone,
        $messageType,
        $templateName,
        $result
    );

    return $result;
}

/**
 * Envia texto livre.
 * Deve ser usado somente quando a conversa/janela de atendimento e as
 * políticas da Meta permitirem. Para lembretes iniciados pelo negócio,
 * prefira template aprovado.
 */
function agenda_saas_whatsapp_send_text(
    int $tenantId,
    string $recipientPhone,
    string $text,
    ?int $appointmentId = null,
    string $messageType = 'text'
): array {

    $recipientPhone = agenda_saas_whatsapp_normalize_phone($recipientPhone);

    if ($recipientPhone === '' || trim($text) === '') {
        return [
            'success' => false,
            'error_code' => 'invalid_message',
            'error_message' => 'Número ou mensagem inválida.',
        ];
    }

    $payload = [
        'messaging_product' => 'whatsapp',
        'recipient_type' => 'individual',
        'to' => $recipientPhone,
        'type' => 'text',
        'text' => [
            'preview_url' => false,
            'body' => $text,
        ],
    ];

    $result = agenda_saas_whatsapp_api_request($tenantId, $payload);

    agenda_saas_whatsapp_log_message(
        $tenantId,
        $appointmentId,
        $recipientPhone,
        $messageType,
        null,
        $result
    );

    return $result;
}

/**
 * Registra a tentativa/resultado de envio.
 */
function agenda_saas_whatsapp_log_message(
    int $tenantId,
    ?int $appointmentId,
    string $recipientPhone,
    string $messageType,
    ?string $templateName,
    array $result
): void {

    global $wpdb;

    $table = $wpdb->prefix . 'whatsapp_messages';

    $metaMessageId = '';

    if (!empty($result['data']['messages'][0]['id'])) {
        $metaMessageId = sanitize_text_field((string) $result['data']['messages'][0]['id']);
    }

    $wpdb->insert(
        $table,
        [
            'tenant_id' => $tenantId,
            'appointment_id' => $appointmentId,
            'recipient_phone' => $recipientPhone,
            'message_type' => sanitize_key($messageType),
            'template_name' => $templateName ? sanitize_key($templateName) : null,
            'meta_message_id' => $metaMessageId ?: null,
            'status' => !empty($result['success']) ? 'sent' : 'failed',
            'error_code' => !empty($result['error_code']) ? sanitize_text_field((string) $result['error_code']) : null,
            'error_message' => !empty($result['error_message']) ? sanitize_text_field((string) $result['error_message']) : null,
            'sent_at' => !empty($result['success']) ? current_time('mysql', true) : null,
        ],
        [
            '%d', '%d', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s'
        ]
    );
}

/*
|--------------------------------------------------------------------------
| REST — configuração e teste do WhatsApp
|--------------------------------------------------------------------------
*/

add_action('rest_api_init', function () {

    register_rest_route('agenda/v1', '/whatsapp', [
        [
            'methods'  => 'GET',
            'callback' => 'agenda_saas_rest_get_whatsapp',
            'permission_callback' => 'agenda_saas_require_auth',
        ],
        [
            'methods'  => 'POST',
            'callback' => 'agenda_saas_rest_save_whatsapp',
            'permission_callback' => 'agenda_saas_require_auth',
        ],
        [
            'methods'  => 'DELETE',
            'callback' => 'agenda_saas_rest_delete_whatsapp',
            'permission_callback' => 'agenda_saas_require_auth',
        ],
    ]);

    register_rest_route('agenda/v1', '/whatsapp/test', [
        'methods'  => 'POST',
        'callback' => 'agenda_saas_rest_test_whatsapp',
        'permission_callback' => 'agenda_saas_require_auth',
    ]);
});

function agenda_saas_rest_get_whatsapp(WP_REST_Request $request) {

    $tenantId = agenda_saas_get_authenticated_tenant_id();
    $config = agenda_saas_whatsapp_get_config((int) $tenantId);

    if (!$config) {
        return new WP_REST_Response([
            'success' => true,
            'connected' => false,
            'whatsapp' => null,
        ], 200);
    }

    return new WP_REST_Response([
        'success' => true,
        'connected' => !empty($config['phone_number_id']) && !empty($config['access_token']),
        'whatsapp' => [
            'phone_number_id' => $config['phone_number_id'],
            'business_account_id' => $config['business_account_id'],
            'display_phone_number' => $config['display_phone_number'],
            'verified_name' => $config['verified_name'],
            'status' => $config['status'],
            'connected_at' => $config['connected_at'],
            'has_access_token' => !empty($config['access_token']),
        ],
    ], 200);
}

function agenda_saas_rest_save_whatsapp(WP_REST_Request $request) {

    $tenantId = agenda_saas_get_authenticated_tenant_id();

    if (!$tenantId) {
        return new WP_Error('unauthorized', 'Sessão inválida.', ['status' => 401]);
    }

    $data = $request->get_json_params();
    $data = is_array($data) ? $data : [];

    $phoneNumberId = trim((string) ($data['phone_number_id'] ?? ''));
    $businessAccountId = trim((string) ($data['business_account_id'] ?? ''));
    $accessToken = trim((string) ($data['access_token'] ?? ''));
    $displayPhoneNumber = trim((string) ($data['display_phone_number'] ?? ''));
    $verifiedName = trim((string) ($data['verified_name'] ?? ''));

    if ($phoneNumberId === '') {
        return new WP_Error('missing_phone_number_id', 'Informe o Phone Number ID.', ['status' => 400]);
    }

    if ($businessAccountId === '') {
        return new WP_Error('missing_business_account_id', 'Informe o Business Account ID.', ['status' => 400]);
    }

    // No cadastro inicial o token é obrigatório. Em uma atualização,
    // o token pode ser omitido para preservar o token já salvo.
    $existing = agenda_saas_whatsapp_get_config((int) $tenantId);
    if (!$existing && $accessToken === '') {
        return new WP_Error('missing_access_token', 'Informe o Access Token.', ['status' => 400]);
    }

    $payload = [
        'phone_number_id' => $phoneNumberId,
        'business_account_id' => $businessAccountId,
        'display_phone_number' => $displayPhoneNumber,
        'verified_name' => $verifiedName,
        'status' => 'connected',
    ];

    if ($accessToken !== '') {
        $payload['access_token'] = $accessToken;
    }

    try {
        $saved = agenda_saas_whatsapp_save_config((int) $tenantId, $payload);
    } catch (Throwable $e) {
        return new WP_Error('whatsapp_save_error', $e->getMessage(), ['status' => 500]);
    }

    if (!$saved) {
        return new WP_Error('whatsapp_save_error', 'Não foi possível salvar a configuração do WhatsApp.', ['status' => 500]);
    }

    return agenda_saas_rest_get_whatsapp($request);
}

function agenda_saas_rest_delete_whatsapp(WP_REST_Request $request) {

    $tenantId = agenda_saas_get_authenticated_tenant_id();

    if (!$tenantId) {
        return new WP_Error('unauthorized', 'Sessão inválida.', ['status' => 401]);
    }

    if (!agenda_saas_whatsapp_disconnect((int) $tenantId)) {
        return new WP_Error('whatsapp_disconnect_error', 'Não foi possível desconectar o WhatsApp.', ['status' => 500]);
    }

    return new WP_REST_Response([
        'success' => true,
        'connected' => false,
        'message' => 'WhatsApp desconectado com sucesso.',
    ], 200);
}

function agenda_saas_rest_test_whatsapp(WP_REST_Request $request) {

    $tenantId = agenda_saas_get_authenticated_tenant_id();

    if (!$tenantId) {
        return new WP_Error('unauthorized', 'Sessão inválida.', ['status' => 401]);
    }

    $data = $request->get_json_params();
    $data = is_array($data) ? $data : [];
    $recipient = trim((string) ($data['recipient_phone'] ?? ''));

    if ($recipient === '') {
        return new WP_Error('missing_recipient', 'Informe o número que receberá a mensagem de teste.', ['status' => 400]);
    }

    $config = agenda_saas_whatsapp_get_config((int) $tenantId);
    if (!$config || empty($config['phone_number_id']) || empty($config['access_token'])) {
        return new WP_Error('not_configured', 'Configure o WhatsApp antes de fazer o teste.', ['status' => 400]);
    }

    // O hello_world é usado aqui para o primeiro teste porque é um template
    // padrão da Meta em contas que disponibilizam esse template. Os lembretes
    // reais serão feitos com templates aprovados pelo próprio tenant.
    $result = agenda_saas_whatsapp_send_template(
        (int) $tenantId,
        $recipient,
        'hello_world',
        'en_US',
        [],
        null,
        'test'
    );

    if (!$result['success']) {
        return new WP_Error(
            'whatsapp_test_failed',
            $result['error_message'] ?: 'A Meta recusou o envio da mensagem de teste.',
            [
                'status' => 400,
                'http_code' => $result['http_code'] ?? 0,
                'meta_error_code' => $result['error_code'] ?? null,
                'details' => $result['data'] ?? null,
            ]
        );
    }

    return new WP_REST_Response([
        'success' => true,
        'message' => 'Mensagem de teste enviada para a API do WhatsApp.',
        'meta_message_id' => $result['data']['messages'][0]['id'] ?? null,
    ], 200);
}

Appointments-list:
<?php

defined('ABSPATH') || exit;

/*
|--------------------------------------------------------------------------
| Lista de agendamentos do tenant logado
|--------------------------------------------------------------------------
*/

add_action('rest_api_init', function () {

    register_rest_route('agenda/v1', '/me/appointments', [
        'methods'  => 'GET',
        'callback' => 'agenda_saas_rest_list_my_appointments',
        'permission_callback' => 'agenda_saas_require_auth',
    ]);

    register_rest_route('agenda/v1', '/me/appointments/(?P<id>\d+)', [
        'methods'  => ['DELETE', 'PUT'],
        'callback' => function (WP_REST_Request $request) {
            if ($request->get_method() === 'PUT') {
                return agenda_saas_rest_reschedule_my_appointment($request);
            }
            return agenda_saas_rest_cancel_my_appointment($request);
        },
        'permission_callback' => 'agenda_saas_require_auth',
    ]);
});

/**
 * Reagenda um agendamento existente, mantendo o mesmo ID e o mesmo
 * evento do Google Calendar.
 */
function agenda_saas_rest_reschedule_my_appointment(WP_REST_Request $request) {

    global $wpdb;

    $tenantId = (int) agenda_saas_get_authenticated_tenant_id();
    $appointmentId = (int) $request->get_param('id');
    $data = $request->get_json_params();
    $data = is_array($data) ? $data : [];

    $newDate = sanitize_text_field((string) ($data['appointment_date'] ?? ''));
    $newStart = sanitize_text_field((string) ($data['start_time'] ?? ''));

    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $newDate)) {
        return new WP_REST_Response(['success' => false, 'error' => 'Data inválida.'], 400);
    }

    if (!preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $newStart)) {
        return new WP_REST_Response(['success' => false, 'error' => 'Horário inválido.'], 400);
    }

    $newStart = substr($newStart, 0, 5) . ':00';
    $timezone = wp_timezone();

    try {
        $newDateTime = new DateTimeImmutable($newDate . ' ' . $newStart, $timezone);
    } catch (Throwable $e) {
        return new WP_REST_Response(['success' => false, 'error' => 'Data ou horário inválido.'], 400);
    }

    if ($newDateTime <= new DateTimeImmutable('now', $timezone)) {
        return new WP_REST_Response(['success' => false, 'error' => 'Escolha uma data e horário futuros.'], 400);
    }

    $appointmentsTable = $wpdb->prefix . 'appointments';
    $servicesTable = $wpdb->prefix . 'services';

    $appointment = $wpdb->get_row(
        $wpdb->prepare(
            "SELECT a.id, a.status, a.customer_name, a.customer_phone,
                    a.appointment_date, a.start_time, a.end_time,
                    a.service_id, a.google_event_id,
                    s.name AS service_name, s.duration_minutes
             FROM $appointmentsTable a
             LEFT JOIN $servicesTable s ON s.id = a.service_id
             WHERE a.id = %d AND a.tenant_id = %d
             LIMIT 1",
            $appointmentId,
            $tenantId
        ),
        ARRAY_A
    );

    if (!$appointment) {
        return new WP_REST_Response(['success' => false, 'error' => 'Agendamento não encontrado.'], 404);
    }

    if ($appointment['status'] === 'cancelled') {
        return new WP_REST_Response(['success' => false, 'error' => 'Este agendamento já foi cancelado.'], 400);
    }

    $durationMinutes = max(1, (int) ($appointment['duration_minutes'] ?? 0));
    $newEndDateTime = $newDateTime->modify('+' . $durationMinutes . ' minutes');
    $newEnd = $newEndDateTime->format('H:i:s');

    // Impede conflito com outro agendamento do mesmo tenant.
    $conflict = $wpdb->get_var(
        $wpdb->prepare(
            "SELECT a.id
             FROM $appointmentsTable a
             WHERE a.tenant_id = %d
               AND a.id != %d
               AND a.status = 'confirmed'
               AND a.appointment_date = %s
               AND a.start_time = %s
             LIMIT 1",
            $tenantId,
            $appointmentId,
            $newDate,
            $newStart
        )
    );

    if ($conflict) {
        return new WP_REST_Response([
            'success' => false,
            'error' => 'Esse horário já está ocupado. Escolha outro horário.',
        ], 409);
    }

    // Mantém o agendamento dentro do horário de funcionamento configurado.
    $businessHoursTable = $wpdb->prefix . 'business_hours';
    $dayOfWeek = (int) $newDateTime->format('w');
    $hours = $wpdb->get_row(
        $wpdb->prepare(
            "SELECT opens_at, closes_at, closed
             FROM $businessHoursTable
             WHERE tenant_id = %d AND day_of_week = %d
             LIMIT 1",
            $tenantId,
            $dayOfWeek
        ),
        ARRAY_A
    );

    if ($hours && (int) $hours['closed'] === 1) {
        return new WP_REST_Response(['success' => false, 'error' => 'O estabelecimento está fechado nesse dia.'], 400);
    }

    if ($hours && !empty($hours['opens_at']) && !empty($hours['closes_at'])) {
        $open = substr((string) $hours['opens_at'], 0, 5);
        $close = substr((string) $hours['closes_at'], 0, 5);
        $startHm = $newDateTime->format('H:i');
        $endHm = $newEndDateTime->format('H:i');

        if ($startHm < $open || $endHm > $close) {
            return new WP_REST_Response(['success' => false, 'error' => 'O horário escolhido está fora do funcionamento.'], 400);
        }
    }

    // Se existir a tabela de datas bloqueadas, respeita bloqueio integral do dia.
    $blockedTable = $wpdb->prefix . 'blocked_dates';
    $blockedExists = $wpdb->get_var($wpdb->prepare("SHOW TABLES LIKE %s", $blockedTable));
    if ($blockedExists === $blockedTable) {
        $blocked = $wpdb->get_var(
            $wpdb->prepare(
                "SELECT id FROM $blockedTable
                 WHERE tenant_id = %d AND blocked_date = %s
                 LIMIT 1",
                $tenantId,
                $newDate
            )
        );
        if ($blocked) {
            return new WP_REST_Response(['success' => false, 'error' => 'Essa data está bloqueada.'], 400);
        }
    }

    $updated = $wpdb->update(
        $appointmentsTable,
        [
            'appointment_date' => $newDate,
            'start_time' => $newStart,
            'end_time' => $newEnd,
            'status' => 'confirmed',
        ],
        ['id' => $appointmentId, 'tenant_id' => $tenantId],
        ['%s', '%s', '%s', '%s'],
        ['%d', '%d']
    );

    if ($updated === false) {
        return new WP_REST_Response(['success' => false, 'error' => 'Não foi possível reagendar o agendamento.'], 500);
    }

    // Remove somente lembretes ainda pendentes e recria os horários para a nova data.
    $remindersTable = $wpdb->prefix . 'whatsapp_reminders';
    $remindersExists = $wpdb->get_var($wpdb->prepare("SHOW TABLES LIKE %s", $remindersTable));
    if ($remindersExists === $remindersTable) {
        $wpdb->query(
            $wpdb->prepare(
                "DELETE FROM $remindersTable
                 WHERE appointment_id = %d AND tenant_id = %d AND status = 'pending'",
                $appointmentId,
                $tenantId
            )
        );
    }

    if (function_exists('agenda_saas_schedule_appointment_whatsapp_reminders')) {
        agenda_saas_schedule_appointment_whatsapp_reminders($appointmentId, $tenantId, $newDate, $newStart);
    }

    // Atualiza o mesmo evento no Google Calendar; não cria outro evento.
    if (!empty($appointment['google_event_id']) && function_exists('agenda_saas_google_sync_appointment')) {
        agenda_saas_google_sync_appointment($appointmentId);
    }

    // Notifica o cliente com o template aprovado de reagendamento.
    if (!empty($appointment['customer_phone']) && function_exists('agenda_saas_whatsapp_send_template')) {
        $components = [[
            'type' => 'body',
            'parameters' => array_map(
                static function ($value) {
                    return ['type' => 'text', 'text' => (string) $value];
                },
                [
                    (string) $appointment['customer_name'],
                    wp_date('d/m/Y', strtotime($newDate), $timezone),
                    substr($newStart, 0, 5),
                    (string) ($appointment['service_name'] ?? ''),
                ]
            ),
        ]];

        $whatsappResult = agenda_saas_whatsapp_send_template(
            $tenantId,
            (string) $appointment['customer_phone'],
            'vai_agenda_reagendamento',
            'pt_BR',
            $components,
            $appointmentId,
            'rescheduling'
        );
    }

    return new WP_REST_Response([
        'success' => true,
        'appointment' => [
            'id' => $appointmentId,
            'appointment_date' => $newDate,
            'start_time' => $newStart,
            'end_time' => $newEnd,
        ],
        'whatsapp' => [
            'attempted' => isset($whatsappResult),
            'success' => !empty($whatsappResult['success']),
            'error_code' => $whatsappResult['error_code'] ?? null,
            'error_message' => $whatsappResult['error_message'] ?? null,
            'http_code' => $whatsappResult['http_code'] ?? null,
            'meta_message_id' => $whatsappResult['data']['messages'][0]['id'] ?? null,
            'details' => $whatsappResult['data'] ?? null,
        ],
    ], 200);
}

/**
 * Cancela um agendamento do tenant logado.
 */
function agenda_saas_rest_cancel_my_appointment(WP_REST_Request $request) {

    global $wpdb;

    $tenantId = agenda_saas_get_authenticated_tenant_id();
    $appointmentId = (int) $request->get_param('id');
    $table_appointments = $wpdb->prefix . 'appointments';

    $appointment = $wpdb->get_row(
        $wpdb->prepare(
            "SELECT id, status, google_event_id, customer_name, customer_phone, appointment_date, start_time, service_id
             FROM $table_appointments
             WHERE id = %d AND tenant_id = %d",
            $appointmentId,
            $tenantId
        ),
        ARRAY_A
    );

    if (!$appointment) {
        return new WP_REST_Response(['success' => false, 'error' => 'Agendamento não encontrado.'], 404);
    }

    if ($appointment['status'] === 'cancelled') {
        return new WP_REST_Response(['success' => true], 200);
    }

    $updated = $wpdb->update(
        $table_appointments,
        ['status' => 'cancelled'],
        ['id' => $appointmentId],
        ['%s'],
        ['%d']
    );

    if ($updated === false) {
        return new WP_REST_Response(['success' => false, 'error' => 'Não foi possível cancelar o agendamento.'], 500);
    }

    if (!empty($appointment['customer_phone'])) {
        $serviceName = '';
        $table_services = $wpdb->prefix . 'services';

        if (!empty($appointment['service_id'])) {
            $serviceName = (string) $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT name FROM $table_services WHERE id = %d LIMIT 1",
                    (int) $appointment['service_id']
                )
            );
        }

        $components = [[
            'type' => 'body',
            'parameters' => array_map(
                static function ($value) {
                    return ['type' => 'text', 'text' => (string) $value];
                },
                [
                    (string) $appointment['customer_name'],
                    wp_date('d/m/Y', strtotime($appointment['appointment_date']), wp_timezone()),
                    substr((string) $appointment['start_time'], 0, 5),
                    $serviceName,
                ]
            ),
        ]];

        agenda_saas_whatsapp_send_template(
            (int) $tenantId,
            (string) $appointment['customer_phone'],
            'vai_agenda_cancelamento',
            'pt_BR',
            $components,
            $appointmentId,
            'cancellation'
        );
    }

    if (!empty($appointment['google_event_id'])) {
        agenda_saas_google_delete_event($tenantId, $appointment['google_event_id']);
    }

    return new WP_REST_Response(['success' => true], 200);
}

function agenda_saas_rest_list_my_appointments(WP_REST_Request $request) {

    global $wpdb;

    $tenantId = agenda_saas_get_authenticated_tenant_id();
    $table_appointments = $wpdb->prefix . 'appointments';
    $table_services = $wpdb->prefix . 'services';

    $from = sanitize_text_field((string) $request->get_param('from'));
    $to = sanitize_text_field((string) $request->get_param('to'));

    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $from)) {
        $from = current_time('Y-m-d');
    }

    $where = "a.tenant_id = %d AND a.appointment_date >= %s AND a.status != 'cancelled'";
    $params = [$tenantId, $from];

    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $to)) {
        $where .= ' AND a.appointment_date <= %s';
        $params[] = $to;
    }

    $appointments = $wpdb->get_results(
        $wpdb->prepare(
            "SELECT
                a.id, a.customer_name, a.customer_phone, a.customer_email,
                a.appointment_date, a.start_time, a.end_time, a.status,
                a.google_sync_status,
                s.name AS service_name
             FROM $table_appointments a
             LEFT JOIN $table_services s ON s.id = a.service_id
             WHERE $where
             ORDER BY a.appointment_date ASC, a.start_time ASC
             LIMIT 200",
            ...$params
        ),
        ARRAY_A
    );

    return new WP_REST_Response(['success' => true, 'appointments' => $appointments], 200);
}

