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
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd; gap: 10px; flex-wrap: wrap;" data-day="${i}">
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
