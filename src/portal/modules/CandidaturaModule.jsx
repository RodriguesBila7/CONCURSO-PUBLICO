import React, { useState } from 'react';
import { 
  FileText, 
  User, 
  GraduationCap, 
  Phone, 
  UploadCloud, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Save, 
  Printer, 
  FileCheck, 
  RotateCcw, 
  ShieldCheck,
  Sparkles,
  Sun,
  Camera,
  Eye,
  UserCheck
} from 'lucide-react';
import { 
  INITIAL_VAGAS, 
  PROVINCIAS_MOCAMBIQUE, 
  validarNUIT, 
  validarBI, 
  validarTelefoneMZ,
  getStoredCandidaturas,
  saveStoredCandidaturas,
  addStoredAuditoria,
  getCandidatePhotoUrl,
  getDefaultValidacaoFacial,
  CANDIDATO_PHOTOS_MALE,
  CANDIDATO_PHOTOS_FEMALE
} from '../mockData';
import sernicLogo from '../../assets/sernic-logo.png';

const STORAGE_DRAFT_KEY = 'sernic_candidatura_draft_v1';

export default function CandidaturaModule({ 
  navigate, 
  selectedVagaPrevia, 
  currentUser, 
  onNotify 
}) {
  // Stepper: 1: Pessoais, 2: Habilitações/Vaga, 3: Contactos, 4: Documentos, 5: Revisão
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);

  const [hasSavedDraft, setHasSavedDraft] = useState(() => {
    try {
      return Boolean(localStorage.getItem(STORAGE_DRAFT_KEY));
    } catch {
      return false;
    }
  });

  // Form State
  const [formData, setFormData] = useState({
    // Passo 1: Dados Pessoais (Padrão em Letras Maiúsculas)
    nomeCompleto: currentUser ? (currentUser.name || '').toUpperCase() : '',
    nuit: currentUser ? (currentUser.nuit || '').toUpperCase() : '',
    biNumero: '',
    biDataEmissao: '',
    biLocalEmissao: 'MAPUTO',
    dataNascimento: '',
    genero: 'Masculino',
    estadoCivil: 'Solteiro(a)',
    nacionalidade: 'Moçambicana',
    provinciaNaturalidade: 'Maputo Cidade',

    // Passo 2: Habilitações & Vaga
    vagaId: selectedVagaPrevia ? selectedVagaPrevia.id : 'VAG-2026-01',
    nivelAcademico: 'Licenciatura',
    cursoNome: '',
    instituicaoEnsino: '',
    anoConclusao: '2024',
    mediaFinal: '',

    // Passo 3: Contactos & Residência
    telefonePrincipal: '',
    telefoneAlternativo: '',
    email: currentUser ? currentUser.email : '',
    provinciaResidencia: 'Maputo Cidade',
    distritoResidencia: '',
    bairroResidencia: '',
    moradaCompleta: '',

    // Passo 4: Documentos (arquivos anexados)
    docsAnexados: {
      biDoc: null,
      certificadoDoc: null,
      cvDoc: null,
      fotoDoc: {
        name: 'Fotografia_Biometrica_Homologada.jpg',
        size: '1.4 MB',
        date: 'Recente'
      },
      registoCriminalDoc: null
    },
    fotoPreviewUrl: getCandidatePhotoUrl('Masculino', 0),
    validacaoFacial: getDefaultValidacaoFacial('Em Análise Documental'),

    // Passo 5: Termo de Honra
    declaracaoVeracidade: false
  });

  const [errors, setErrors] = useState({});

  // Manipular alteração de inputs de texto com padrão em MAIÚSCULAS e detecção de GÊNERO
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let processedValue = value;

    if (type === 'checkbox') {
      processedValue = checked;
    } else if (name === 'email') {
      processedValue = value.toLowerCase();
    } else if (name === 'genero') {
      processedValue = value;
    } else if (typeof value === 'string' && type !== 'date') {
      // Conversão padrão automática para letras maiúsculas conforme edital oficial
      processedValue = value.toUpperCase();
    }

    setFormData(prev => {
      const next = { ...prev, [name]: processedValue };
      // Inteligência de Gênero: alterna fotos do catálogo oficial e validação facial
      if (name === 'genero') {
        const isFeminino = processedValue === 'Feminino';
        const newGender = isFeminino ? 'Feminino' : 'Masculino';
        next.genero = newGender;
        next.fotoPreviewUrl = getCandidatePhotoUrl(newGender, 0);
        next.docsAnexados = {
          ...next.docsAnexados,
          fotoDoc: {
            name: `Fotografia_Biometrica_${newGender.toUpperCase()}.jpg`,
            size: '1.4 MB',
            date: 'Recente'
          }
        };
      }
      return next;
    });

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Simular upload de arquivo
  const handleFileUpload = (docKey, fileName) => {
    setFormData(prev => ({
      ...prev,
      docsAnexados: {
        ...prev.docsAnexados,
        [docKey]: {
          name: fileName,
          size: '1.4 MB',
          date: '10:30'
        }
      }
    }));
    if (errors[docKey]) {
      setErrors(prev => ({ ...prev, [docKey]: null }));
    }
  };

  // Salvar Rascunho no LocalStorage
  const handleSaveDraft = () => {
    try {
      localStorage.setItem(STORAGE_DRAFT_KEY, JSON.stringify(formData));
      setHasSavedDraft(true);
      if (onNotify) {
        onNotify('success', 'Rascunho da sua candidatura guardado com sucesso neste dispositivo!');
      } else {
        alert('Rascunho guardado com sucesso!');
      }
    } catch {
      alert('Erro ao guardar rascunho no navegador.');
    }
  };

  // Restaurar Rascunho
  const handleLoadDraft = () => {
    try {
      const saved = localStorage.getItem(STORAGE_DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
        if (onNotify) {
          onNotify('info', 'Rascunho anterior carregado com sucesso!');
        }
      }
    } catch {
      alert('Erro ao carregar rascunho.');
    }
  };

  // Validação por Etapa
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.nomeCompleto.trim()) newErrors.nomeCompleto = 'O nome completo é obrigatório.';
      if (!validarNUIT(formData.nuit)) newErrors.nuit = 'Informe um NUIT moçambicano válido (9 dígitos numéricos, ex: 123456789).';
      if (!validarBI(formData.biNumero)) newErrors.biNumero = 'Informe um BI válido (12 dígitos seguidos de 1 letra, ex: 000000000000M).';
      if (!formData.dataNascimento) {
        newErrors.dataNascimento = 'A data de nascimento é obrigatória.';
      } else {
        const anoNasc = new Date(formData.dataNascimento).getFullYear();
        const anoAtual = 2026;
        const idade = anoAtual - anoNasc;
        if (idade < 18 || idade > 45) {
          newErrors.dataNascimento = `A idade permitida é entre 18 e 45 anos (sua idade calculada: ${idade} anos).`;
        }
      }
    }

    if (step === 2) {
      if (!formData.vagaId) newErrors.vagaId = 'Selecione uma vaga a concurso.';
      if (!formData.cursoNome.trim()) newErrors.cursoNome = 'Informe o curso ou área de formação.';
      if (!formData.instituicaoEnsino.trim()) newErrors.instituicaoEnsino = 'Informe a instituição de ensino.';
    }

    if (step === 3) {
      if (!validarTelefoneMZ(formData.telefonePrincipal)) {
        newErrors.telefonePrincipal = 'Informe um número de telefone moçambicano válido (ex: 84 123 4567 ou +258 84 123 4567).';
      }
      if (!formData.email.trim() || !formData.email.includes('@')) {
        newErrors.email = 'Informe um endereço de e-mail válido para receber notificações.';
      }
      if (!formData.distritoResidencia.trim()) {
        newErrors.distritoResidencia = 'Informe o município ou distrito.';
      }
    }

    if (step === 4) {
      if (!formData.docsAnexados.biDoc) newErrors.biDoc = 'O documento de identificação (BI/Passaporte) é obrigatório.';
      if (!formData.docsAnexados.certificadoDoc) newErrors.certificadoDoc = 'O certificado de habilitações é obrigatório.';
      if (!formData.docsAnexados.cvDoc) newErrors.cvDoc = 'O Curriculum Vitae em formato PDF é obrigatório.';
      if (!formData.docsAnexados.fotoDoc) newErrors.fotoDoc = 'A fotografia tipo passe é estritamente obrigatória para validação biométrica e reconhecimento facial.';
    }

    if (step === 5) {
      if (!formData.declaracaoVeracidade) {
        newErrors.declaracaoVeracidade = 'Deve declarar por sua honra a veracidade das informações para submeter a candidatura.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Avançar Etapa
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Voltar Etapa
  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submeter Candidatura
  const handleSubmitCandidatura = async () => {
    if (!validateStep(5)) return;

    setIsSubmitting(true);
    const vagaSelecionada = INITIAL_VAGAS.find(v => v.id === formData.vagaId) || INITIAL_VAGAS[0];
    const randomProtocol = Math.floor(10000 + Math.random() * 90000);
    const codigoCandidaturaGerado = `SERNIC-2026-REC-${randomProtocol}`;
    const dataSubmissaoFormatada = new Date().toLocaleDateString('pt-MZ') + ' às ' + new Date().toLocaleTimeString('pt-MZ');
    const chaveAuth = 'MZ-SERNIC-AUTH-' + Math.floor(100000 + Math.random() * 900000);

    const payload = {
      codigoCandidatura: codigoCandidaturaGerado,
      nuit: formData.nuit,
      nomeCompleto: formData.nomeCompleto,
      bi: formData.biNumero,
      email: formData.email,
      telefone: formData.telefonePrincipal,
      carreira: vagaSelecionada.titulo,
      nivelAcademico: `${formData.nivelAcademico} em ${formData.cursoNome}`,
      provincia: formData.provinciaResidencia,
      dataSubmissao: new Date().toISOString()
    };

    const codigoFinal = codigoCandidaturaGerado;

    // Persistir novo candidato diretamente para visualização imediata no módulo Inscritos no Concurso
    const novoCandidato = {
      codigoCandidatura: codigoFinal,
      biNumero: formData.biNumero,
      nuit: formData.nuit,
      nomeCompleto: formData.nomeCompleto,
      genero: formData.genero,
      fotoUrl: formData.fotoPreviewUrl || getCandidatePhotoUrl(formData.genero, 0),
      validacaoFacial: formData.validacaoFacial || getDefaultValidacaoFacial('Em Análise Documental'),
      dataNascimento: formData.dataNascimento,
      idade: formData.dataNascimento ? (new Date().getFullYear() - new Date(formData.dataNascimento).getFullYear()) : 26,
      telefone: formData.telefonePrincipal,
      email: formData.email,
      provincia: formData.provinciaResidencia,
      distrito: formData.distritoResidencia || 'Sede',
      morada: formData.moradaCompleta || formData.bairroResidencia || 'Residência oficial',
      filiacaoPai: 'Não declarado',
      filiacaoMae: 'Não declarado',
      estadoCivil: formData.estadoCivil,
      vagaId: vagaSelecionada.id,
      vagaTitulo: vagaSelecionada.titulo,
      carreira: vagaSelecionada.carreira || vagaSelecionada.titulo,
      dataSubmissao: new Date().toISOString(),
      status: 'Em Análise Documental',
      faseAtual: 1,
      habilitacoes: {
        grau: formData.nivelAcademico,
        curso: formData.cursoNome,
        instituicao: formData.instituicaoEnsino,
        anoConclusao: formData.anoConclusao,
        mediaFinal: formData.mediaFinal || '14.5'
      },
      documentos: [
        { id: 'doc-bi', tipo: 'Bilhete de Identidade Autenticado', status: 'Sob Análise', tamanho: '1.2 MB', data: new Date().toISOString().split('T')[0] },
        { id: 'doc-cert', tipo: 'Certificado de Habilitações', status: 'Sob Análise', tamanho: '2.1 MB', data: new Date().toISOString().split('T')[0] },
        { id: 'doc-crim', tipo: 'Certidão de Registo Criminal', status: 'Sob Análise', tamanho: '850 KB', data: new Date().toISOString().split('T')[0] },
        { id: 'doc-cv', tipo: 'Curriculum Vitae', status: 'Sob Análise', tamanho: '1.5 MB', data: new Date().toISOString().split('T')[0] }
      ],
      detalhesFase: {
        titulo: '1ª Fase: Avaliação Documental em Curso',
        dataEvento: 'Conforme calendário oficial do Edital',
        local: `Delegação Provincial do SERNIC (${formData.provinciaResidencia})`,
        observacoes: 'A comissão de júri está a conferir a autenticidade e validade jurídica dos documentos submetidos.',
        mensagemComissao: `O seu processo de candidatura foi recebido e encontra-se na 1ª Fase de Avaliação Documental. Se aprovad${formData.genero === 'Feminino' ? 'a' : 'o'}, passará à 2ª Fase: Entrevista Profissional (como ${formData.genero === 'Feminino' ? 'convocada' : 'convocado'}).`
      },
      deliberacaoJuri: {
        decisao: 'Em Análise Documental',
        dataDeliberacao: null,
        operador: null,
        parecer: 'Processo na fila de triagem documental da comissão de júri.'
      },
      historico: [
        { data: new Date().toISOString().split('T')[0], etapa: 'Inscrição Submetida', descricao: 'Processo registado no módulo Inscritos no Concurso.' },
        { data: new Date().toISOString().split('T')[0], etapa: '1ª Fase: Avaliação Documental', descricao: 'Início da conferência de conformidade documental pelo júri.' }
      ]
    };

    try {
      const listaAtual = getStoredCandidaturas();
      saveStoredCandidaturas([novoCandidato, ...listaAtual]);
      addStoredAuditoria({
        acao: 'Nova Inscrição no Concurso',
        candidato: `${novoCandidato.nomeCompleto} (${novoCandidato.codigoCandidatura})`,
        estadoAnterior: 'Sem inscrição',
        novoEstado: 'Em Análise Documental',
        motivo: `Candidatura submetida para ${novoCandidato.vagaTitulo} (${novoCandidato.provincia})`,
        operador: 'Sistema SERNIC (Portal do Candidato)'
      });
    } catch (err) {
      console.warn('Erro ao salvar candidatura em localStorage', err);
    }

    try {
      const res = await fetch('/api/candidaturas/solicitar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setSubmissionSuccess({
          codigo: data.codigoCandidatura || codigoFinal,
          dados: payload,
          vaga: vagaSelecionada,
          dataTexto: dataSubmissaoFormatada,
          chaveAuth
        });
      } else {
        setSubmissionSuccess({
          codigo: codigoFinal,
          dados: payload,
          vaga: vagaSelecionada,
          dataTexto: dataSubmissaoFormatada,
          chaveAuth
        });
      }
    } catch {
      setSubmissionSuccess({
        codigo: codigoFinal,
        dados: payload,
        vaga: vagaSelecionada,
        dataTexto: dataSubmissaoFormatada,
        chaveAuth
      });
    } finally {
      setIsSubmitting(false);
      try {
        localStorage.removeItem(STORAGE_DRAFT_KEY);
      } catch {}
    }
  };

  const vagaEscolhida = INITIAL_VAGAS.find(v => v.id === formData.vagaId) || INITIAL_VAGAS[0];

  // ECRÃ DE SUCESSO
  if (submissionSuccess) {
    return (
      <div className="module-page-container" style={{ maxWidth: '850px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '1.5rem 0 2rem 0' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem auto' }}>
            <CheckCircle2 size={42} />
          </div>

          <span className="vaga-badge-status vaga-status-aberto" style={{ fontSize: '0.82rem', padding: '0.3rem 0.8rem' }}>
            Inscrição Concluída • Entrada no Módulo Inscritos no Concurso
          </span>

          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--portal-text-main)', marginTop: '0.6rem' }}>
            Processo Submetido ao SERNIC
          </h2>

          <p style={{ fontSize: '0.96rem', color: 'var(--portal-text-muted)', maxWidth: '620px', margin: '0.4rem auto 1.5rem auto', lineHeight: 1.6 }}>
            A sua candidatura foi gravada com sucesso. O processo encontra-se na <strong>1ª Fase: Avaliação Documental</strong>. 
            Após validação dos documentos pelo Júri, caso aprovado, avançará para a <strong>2ª Fase: Entrevista Profissional</strong>.
          </p>

          <div style={{ background: 'var(--portal-card-inner)', border: '2px dashed #c59b27', borderRadius: '14px', padding: '1.5rem', display: 'inline-block', minWidth: '320px', marginBottom: '2rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--portal-text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>
              Número de Protocolo Oficial
            </span>
            <div style={{ fontSize: '1.9rem', fontWeight: 900, color: 'var(--portal-text-main)', letterSpacing: '0.02em', marginTop: '0.3rem' }}>
              {submissionSuccess.codigo}
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem', padding: '0.2rem 0.65rem', borderRadius: '9999px', background: '#fef3c7', color: '#92400e', fontSize: '0.76rem', fontWeight: 800 }}>
              <span>Estado Inicial: Em Análise Documental (1ª Fase)</span>
            </div>
          </div>

          {/* ACÇÕES DE SUCESSO */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <button
              type="button"
              className="btn-vaga-candidatar"
              onClick={() => window.print()}
              style={{ padding: '0.75rem 1.4rem' }}
            >
              <Printer size={18} />
              <span>Imprimir / Salvar PDF</span>
            </button>

            <button
              type="button"
              className="btn-vaga-detalhes"
              onClick={() => navigate('/portal-recrutamento/consulta')}
              style={{ padding: '0.75rem 1.4rem' }}
            >
              <span>Consultar Estado Agora</span>
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              className="btn-draft"
              onClick={() => navigate('/portal-recrutamento')}
              style={{ padding: '0.75rem 1.4rem' }}
            >
              <span>Voltar ao Portal</span>
            </button>
          </div>
        </div>

        {/* COMPROVATIVO FORMAL PARA IMPRESSÃO / ARQUIVO */}
        <div className="comprovativo-print-modal" style={{ border: '1px solid #cbd5e1', boxShadow: 'none' }}>
          <div style={{ textAlign: 'center', borderBottom: '2px solid #0f2042', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <img src={sernicLogo} alt="Logótipo SERNIC" style={{ width: '64px', height: '64px', margin: '0 auto 0.4rem auto' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 900, margin: 0, textTransform: 'uppercase' }}>
              República de Moçambique • Procuradoria-Geral da República
            </h3>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f2042', margin: '0.2rem 0', textTransform: 'uppercase' }}>
              SERVIÇO NACIONAL DE INVESTIGAÇÃO CRIMINAL
            </h4>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, margin: 0, color: '#64748b' }}>
              COMPROVATIVO OFICIAL DE SUBMISSÃO DE CANDIDATURA ONLINE
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
            <div>
              <p><strong>N.º de Candidatura:</strong> {submissionSuccess.codigo}</p>
              <p><strong>Nome Completo:</strong> {formData.nomeCompleto}</p>
              <p><strong>Bilhete de Identidade:</strong> {formData.biNumero}</p>
              <p><strong>NUIT:</strong> {formData.nuit}</p>
              <p><strong>Data de Nascimento:</strong> {formData.dataNascimento}</p>
            </div>
            <div>
              <p><strong>Carreira Pretendida:</strong> {submissionSuccess.vaga.titulo}</p>
              <p><strong>Código do Edital:</strong> {submissionSuccess.vaga.codigoEdital}</p>
              <p><strong>Contacto Telefónico:</strong> {formData.telefonePrincipal}</p>
              <p><strong>Correio Eletrónico:</strong> {formData.email}</p>
              <p><strong>Data de Submissão:</strong> {submissionSuccess.dataTexto}</p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.8rem', fontSize: '0.78rem', color: '#475569', lineHeight: 1.5 }}>
            <p><strong>Documentos Homologados no Processo:</strong> BI/Passaporte, Certificado de Habilitações, Curriculum Vitae e Registo Criminal anexados electronicamente.</p>
            <p style={{ marginTop: '0.4rem', fontStyle: 'italic' }}>
              Nota: Este documento comprova a inscrição do candidato e deverá ser obrigatoriamente apresentado no dia da realização das provas de conhecimentos e testes psicotécnicos acompanhado do documento de identificação original.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #cbd5e1' }}>
            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
              Chave Criptográfica de Validação:<br />
              <strong style={{ color: '#0f2042' }}>{submissionSuccess.chaveAuth}</strong>
            </div>
            <div style={{ textAlign: 'center', fontSize: '0.8rem' }}>
              <p style={{ borderBottom: '1px solid #000', width: '220px', margin: '0 auto 0.3rem auto' }}></p>
              <span>Comissão do Concurso Público SERNIC</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="module-page-container">
      {/* 1. TOPO DO FORMULÁRIO */}
      <div className="module-page-header">
        <div className="module-page-title-group">
          <h2>
            <FileText size={26} color="#c59b27" />
            Formulário de Candidatura-SERNIC
          </h2>
          <p>
            Preencha todos os campos obrigatórios. Pode salvar o seu rascunho e continuar a qualquer momento.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          {hasSavedDraft && (
            <button
              type="button"
              className="btn-draft"
              onClick={handleLoadDraft}
              title="Carregar dados guardados anteriormente"
            >
              <RotateCcw size={15} />
              <span>Restaurar Rascunho</span>
            </button>
          )}

          <button
            type="button"
            className="btn-draft"
            onClick={handleSaveDraft}
            title="Guardar progresso no navegador"
          >
            <Save size={15} />
            <span>Guardar Rascunho</span>
          </button>
        </div>
      </div>

      {/* 2. BARRA DE PROGRESSO DO STEPPER */}
      <div className="stepper-header">
        <div className="stepper-progress-line">
          <div 
            className="stepper-progress-fill" 
            style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
          />
        </div>

        <div className={`stepper-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`} onClick={() => setCurrentStep(1)}>
          <div className="step-circle">{currentStep > 1 ? '✓' : '1'}</div>
          <span className="step-label">Dados Pessoais</span>
        </div>

        <div className={`stepper-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`} onClick={() => validateStep(1) && setCurrentStep(2)}>
          <div className="step-circle">{currentStep > 2 ? '✓' : '2'}</div>
          <span className="step-label">Habilitações</span>
        </div>

        <div className={`stepper-step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`} onClick={() => validateStep(2) && setCurrentStep(3)}>
          <div className="step-circle">{currentStep > 3 ? '✓' : '3'}</div>
          <span className="step-label">Contactos</span>
        </div>

        <div className={`stepper-step ${currentStep >= 4 ? 'active' : ''} ${currentStep > 4 ? 'completed' : ''}`} onClick={() => validateStep(3) && setCurrentStep(4)}>
          <div className="step-circle">{currentStep > 4 ? '✓' : '4'}</div>
          <span className="step-label">Documentos</span>
        </div>

        <div className={`stepper-step ${currentStep >= 5 ? 'active' : ''}`} onClick={() => validateStep(4) && setCurrentStep(5)}>
          <div className="step-circle">5</div>
          <span className="step-label">Revisão</span>
        </div>
      </div>



      {/* 3. CONTEÚDO DE CADA ETAPA */}
      <div>
        {/* ETAPA 1: DADOS PESSOAIS */}
        {currentStep === 1 && (
          <div className="form-section-card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--portal-text-main)', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <User size={20} color="#c59b27" /> Identificação e Dados Pessoais
            </h3>

            <div className="form-grid-2">
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Nome Completo <span className="required">*</span></label>
                <input
                  type="text"
                  name="nomeCompleto"
                  className={`form-input ${errors.nomeCompleto ? 'error' : ''}`}
                  placeholder="EX: ARMANDO CARLOS MONDLANE"
                  value={formData.nomeCompleto}
                  onChange={handleChange}
                />
                {errors.nomeCompleto && <span className="form-error-msg">{errors.nomeCompleto}</span>}
              </div>

              <div className="form-group">
                <label>NUIT <span className="required">*</span></label>
                <input
                  type="text"
                  name="nuit"
                  maxLength={9}
                  className={`form-input ${errors.nuit ? 'error' : ''}`}
                  placeholder="EX: 123456789"
                  value={formData.nuit}
                  onChange={handleChange}
                />
                {errors.nuit && <span className="form-error-msg">{errors.nuit}</span>}
              </div>

              <div className="form-group">
                <label>Bilhete de Identidade (BI) <span className="required">*</span></label>
                <input
                  type="text"
                  name="biNumero"
                  maxLength={13}
                  className={`form-input ${errors.biNumero ? 'error' : ''}`}
                  placeholder="EX: 000000000000M"
                  value={formData.biNumero}
                  onChange={handleChange}
                />
                {errors.biNumero && <span className="form-error-msg">{errors.biNumero}</span>}
              </div>

              <div className="form-group">
                <label>Data de Nascimento <span className="required">*</span></label>
                <input
                  type="date"
                  name="dataNascimento"
                  className={`form-input ${errors.dataNascimento ? 'error' : ''}`}
                  value={formData.dataNascimento}
                  onChange={handleChange}
                />
                {errors.dataNascimento && <span className="form-error-msg">{errors.dataNascimento}</span>}
              </div>

              <div className="form-group">
                <label>Género <span className="required">*</span></label>
                <select name="genero" className="form-select" value={formData.genero} onChange={handleChange}>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                </select>
              </div>

              <div className="form-group">
                <label>Estado Civil</label>
                <select name="estadoCivil" className="form-select" value={formData.estadoCivil} onChange={handleChange}>
                  <option value="Solteiro(a)">Solteiro(a)</option>
                  <option value="Casado(a)">Casado(a)</option>
                  <option value="União de Facto">União de Facto</option>
                  <option value="Divorciado(a)">Divorciado(a)</option>
                  <option value="Viúvo(a)">Viúvo(a)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Província de Naturalidade <span className="required">*</span></label>
                <select name="provinciaNaturalidade" className="form-select" value={formData.provinciaNaturalidade} onChange={handleChange}>
                  {PROVINCIAS_MOCAMBIQUE.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ETAPA 2: HABILITAÇÕES & ESCOLHA DA VAGA */}
        {currentStep === 2 && (
          <div className="form-section-card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--portal-text-main)', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <GraduationCap size={20} color="#c59b27" /> Carreira Concorrida & Grau Académico
            </h3>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Concurso / Vaga Pretendida <span className="required">*</span></label>
              <select 
                name="vagaId" 
                className={`form-select ${errors.vagaId ? 'error' : ''}`}
                value={formData.vagaId} 
                onChange={handleChange}
              >
                {INITIAL_VAGAS.filter(v => v.status === 'Aberto').map(v => (
                  <option key={v.id} value={v.id}>
                    {v.titulo} ({v.codigoEdital}) • {v.vagas} Vagas • Prazo: {new Date(v.dataLimite).toLocaleDateString('pt-MZ')}
                  </option>
                ))}
              </select>

              {vagaEscolhida && (
                <div style={{ marginTop: '0.8rem', backgroundColor: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.84rem' }}>
                  <p><strong>Regime de Carreira:</strong> {vagaEscolhida.regime}</p>
                  <p><strong>Remuneração:</strong> {vagaEscolhida.remuneracao}</p>
                </div>
              )}
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Nível Académico <span className="required">*</span></label>
                <select name="nivelAcademico" className="form-select" value={formData.nivelAcademico} onChange={handleChange}>
                  <option value="12ª Classe">12ª Classe / Nível Médio</option>
                  <option value="Bacharelato">Bacharelato</option>
                  <option value="Licenciatura">Licenciatura</option>
                  <option value="Pós-Graduação">Pós-Graduação</option>
                  <option value="Mestrado">Mestrado</option>
                  <option value="Doutoramento">Doutoramento</option>
                </select>
              </div>

              <div className="form-group">
                <label>Curso / Especialidade <span className="required">*</span></label>
                <input
                  type="text"
                  name="cursoNome"
                  className={`form-input ${errors.cursoNome ? 'error' : ''}`}
                  placeholder="EX: DIREITO, CIÊNCIAS POLICIAIS, INFORMÁTICA..."
                  value={formData.cursoNome}
                  onChange={handleChange}
                />
                {errors.cursoNome && <span className="form-error-msg">{errors.cursoNome}</span>}
              </div>

              <div className="form-group">
                <label>Instituição de Ensino <span className="required">*</span></label>
                <input
                  type="text"
                  name="instituicaoEnsino"
                  className={`form-input ${errors.instituicaoEnsino ? 'error' : ''}`}
                  placeholder="EX: UEM, ACIPOL, ISCISA, UDM..."
                  value={formData.instituicaoEnsino}
                  onChange={handleChange}
                />
                {errors.instituicaoEnsino && <span className="form-error-msg">{errors.instituicaoEnsino}</span>}
              </div>

              <div className="form-group">
                <label>Ano de Conclusão</label>
                <input
                  type="number"
                  name="anoConclusao"
                  min="1990"
                  max="2026"
                  className="form-input"
                  value={formData.anoConclusao}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        )}

        {/* ETAPA 3: CONTACTOS & RESIDÊNCIA */}
        {currentStep === 3 && (
          <div className="form-section-card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--portal-text-main)', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Phone size={20} color="#c59b27" /> Contactos Oficiais & Endereço de Residência
            </h3>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Telefone Principal <span className="required">*</span></label>
                <input
                  type="tel"
                  name="telefonePrincipal"
                  className={`form-input ${errors.telefonePrincipal ? 'error' : ''}`}
                  placeholder="Ex: +258 84 123 4567"
                  value={formData.telefonePrincipal}
                  onChange={handleChange}
                />
                {errors.telefonePrincipal && <span className="form-error-msg">{errors.telefonePrincipal}</span>}
              </div>

              <div className="form-group">
                <label>Telefone Alternativo</label>
                <input
                  type="tel"
                  name="telefoneAlternativo"
                  className="form-input"
                  placeholder="Ex: +258 82 987 6543"
                  value={formData.telefoneAlternativo}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Correio Eletrónico (E-mail) <span className="required">*</span></label>
                <input
                  type="email"
                  name="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="Ex: seu.nome@exemplo.mz"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <span className="form-error-msg">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label>Província de Residência <span className="required">*</span></label>
                <select name="provinciaResidencia" className="form-select" value={formData.provinciaResidencia} onChange={handleChange}>
                  {PROVINCIAS_MOCAMBIQUE.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Distrito / Município <span className="required">*</span></label>
                <input
                  type="text"
                  name="distritoResidencia"
                  className={`form-input ${errors.distritoResidencia ? 'error' : ''}`}
                  placeholder="EX: KAMPUFUMO, MATOLA, BEIRA, NAMPULA..."
                  value={formData.distritoResidencia}
                  onChange={handleChange}
                />
                {errors.distritoResidencia && <span className="form-error-msg">{errors.distritoResidencia}</span>}
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Bairro e Morada</label>
                <input
                  type="text"
                  name="moradaCompleta"
                  className="form-input"
                  placeholder="EX: BAIRRO CENTRAL, RUA DAS FLORES N.º 45"
                  value={formData.moradaCompleta}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        )}

        {/* ETAPA 4: ANEXAÇÃO DE DOCUMENTOS */}
        {currentStep === 4 && (
          <div className="form-section-card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--portal-text-main)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <UploadCloud size={20} color="#c59b27" /> Documentação Obrigatória em Anexo
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--portal-text-muted)', marginBottom: '1.5rem' }}>
              Carregue os ficheiros em formato PDF ou imagem (JPG/PNG). Tamanho máximo: 5 MB por documento.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
              {/* Doc 1: BI */}
              <div 
                className={`doc-upload-box ${formData.docsAnexados.biDoc ? 'uploaded' : ''}`}
                onClick={() => handleFileUpload('biDoc', 'Bilhete_Identidade_Digitalizado.pdf')}
              >
                {formData.docsAnexados.biDoc ? (
                  <>
                    <FileCheck size={32} color="#15803d" />
                    <strong style={{ fontSize: '0.9rem', color: '#15803d' }}>BI / Passaporte Anexado</strong>
                    <span style={{ fontSize: '0.78rem', color: '#475569' }}>{formData.docsAnexados.biDoc.name}</span>
                    <span style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 700 }}>Clique para substituir</span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={32} color="#c59b27" />
                    <strong style={{ fontSize: '0.9rem' }}>Bilhete de Identidade (BI) <span style={{ color: '#c32026' }}>*</span></strong>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Cópia autenticada e legível</span>
                    <span style={{ fontSize: '0.75rem', color: '#c59b27', fontWeight: 700 }}>Carregar Ficheiro</span>
                  </>
                )}
                {errors.biDoc && <span className="form-error-msg">{errors.biDoc}</span>}
              </div>

              {/* Doc 2: Certificado */}
              <div 
                className={`doc-upload-box ${formData.docsAnexados.certificadoDoc ? 'uploaded' : ''}`}
                onClick={() => handleFileUpload('certificadoDoc', 'Certificado_Habilitacoes_Homologado.pdf')}
              >
                {formData.docsAnexados.certificadoDoc ? (
                  <>
                    <FileCheck size={32} color="#15803d" />
                    <strong style={{ fontSize: '0.9rem', color: '#15803d' }}>Certificado Anexado</strong>
                    <span style={{ fontSize: '0.78rem', color: '#475569' }}>{formData.docsAnexados.certificadoDoc.name}</span>
                    <span style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 700 }}>Clique para substituir</span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={32} color="#c59b27" />
                    <strong style={{ fontSize: '0.9rem' }}>Certificado de Habilitações <span style={{ color: '#c32026' }}>*</span></strong>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Certificado ou Diploma de Curso</span>
                    <span style={{ fontSize: '0.75rem', color: '#c59b27', fontWeight: 700 }}>Carregar Ficheiro</span>
                  </>
                )}
                {errors.certificadoDoc && <span className="form-error-msg">{errors.certificadoDoc}</span>}
              </div>

              {/* Doc 3: CV */}
              <div 
                className={`doc-upload-box ${formData.docsAnexados.cvDoc ? 'uploaded' : ''}`}
                onClick={() => handleFileUpload('cvDoc', 'Curriculum_Vitae_SERNIC.pdf')}
              >
                {formData.docsAnexados.cvDoc ? (
                  <>
                    <FileCheck size={32} color="#15803d" />
                    <strong style={{ fontSize: '0.9rem', color: '#15803d' }}>Curriculum Vitae Anexado</strong>
                    <span style={{ fontSize: '0.78rem', color: '#475569' }}>{formData.docsAnexados.cvDoc.name}</span>
                    <span style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 700 }}>Clique para substituir</span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={32} color="#c59b27" />
                    <strong style={{ fontSize: '0.9rem' }}>Curriculum Vitae (CV) <span style={{ color: '#c32026' }}>*</span></strong>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Actualizado e assinado</span>
                    <span style={{ fontSize: '0.75rem', color: '#c59b27', fontWeight: 700 }}>Carregar Ficheiro</span>
                  </>
                )}
                {errors.cvDoc && <span className="form-error-msg">{errors.cvDoc}</span>}
              </div>

              {/* Doc 4: Fotografia Obrigatória com Biometria e Análise Facial */}
              <div 
                className={`doc-upload-box biometric-upload-card ${formData.docsAnexados.fotoDoc ? 'uploaded' : ''}`}
                style={{ gridColumn: 'span 2' }}
              >
                <div className="biometric-form-inner">
                  <div className="biometric-form-preview-col">
                    <div className="biometric-form-avatar-frame">
                      <img 
                        src={formData.fotoPreviewUrl || getCandidatePhotoUrl(formData.genero, 0)} 
                        alt="Fotografia do Candidato" 
                        className="biometric-form-avatar-img"
                      />
                      <div className="hud-corner top-left" />
                      <div className="hud-corner top-right" />
                      <div className="hud-corner bottom-left" />
                      <div className="hud-corner bottom-right" />
                      <div className="hud-crosshair" />
                    </div>
                    <button
                      type="button"
                      className="btn-trocar-foto-biometrica"
                      onClick={(e) => {
                        e.stopPropagation();
                        const pool = formData.genero === 'Feminino' ? CANDIDATO_PHOTOS_FEMALE : CANDIDATO_PHOTOS_MALE;
                        const currIdx = pool.indexOf(formData.fotoPreviewUrl);
                        const nextIdx = (currIdx + 1) % pool.length;
                        const nextUrl = pool[nextIdx];
                        setFormData(prev => ({
                          ...prev,
                          fotoPreviewUrl: nextUrl,
                          docsAnexados: {
                            ...prev.docsAnexados,
                            fotoDoc: { name: `Foto_Passe_Biometrica_${nextIdx + 1}.jpg`, size: '1.5 MB', date: 'Recente' }
                          }
                        }));
                        if (onNotify) onNotify('success', 'Fotografia alterada com validação facial instantânea.');
                      }}
                    >
                      <Camera size={13} />
                      <span>Alternar Fotografia Homologada</span>
                    </button>
                  </div>

                  <div className="biometric-form-info-col">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Sparkles size={18} color="#c59b27" />
                        <strong style={{ fontSize: '0.98rem', color: 'var(--portal-text-main)' }}>
                          Fotografia Tipo Passe (3x4) Biometrizada <span style={{ color: '#c32026' }}>*</span>
                        </strong>
                      </div>
                      <span className="biometric-ai-tag">
                        <CheckCircle2 size={13} /> IA SERNIC: 98% Aprovada
                      </span>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--portal-text-muted)', marginBottom: '0.8rem' }}>
                      A fotografia é <strong>estritamente obrigatória</strong> e analisada pelo motor de inteligência artificial do concurso para garantia de integridade, enquadramento facial ICAO 9303 e iluminação.
                    </p>

                    <div className="biometric-checks-pills">
                      <div className="bio-check-pill success">
                        <UserCheck size={13} color="#2563eb" />
                        <span>Gênero IA: <strong>{formData.genero === 'Feminino' ? 'Feminino (Mulher • Convocada)' : 'Masculino (Homem • Convocado)'}</strong></span>
                      </div>
                      <div className="bio-check-pill success">
                        <Sun size={13} color="#f59e0b" />
                        <span>Iluminação: <strong>97% Equilibrada (Sem sombras)</strong></span>
                      </div>
                      <div className="bio-check-pill success">
                        <ShieldCheck size={13} color="#16a34a" />
                        <span>Rosto: <strong>100% Centralizado</strong></span>
                      </div>
                      <div className="bio-check-pill success">
                        <Eye size={13} color="#2563eb" />
                        <span>Fundo: <strong>Neutro Homologado</strong></span>
                      </div>
                    </div>

                    {errors.fotoDoc && (
                      <span className="form-error-msg" style={{ marginTop: '0.5rem', display: 'block' }}>
                        {errors.fotoDoc}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Doc 5: Registo Criminal */}
              <div 
                className={`doc-upload-box ${formData.docsAnexados.registoCriminalDoc ? 'uploaded' : ''}`}
                onClick={() => handleFileUpload('registoCriminalDoc', 'Certificado_Registo_Criminal.pdf')}
              >
                {formData.docsAnexados.registoCriminalDoc ? (
                  <>
                    <FileCheck size={32} color="#15803d" />
                    <strong style={{ fontSize: '0.9rem', color: '#15803d' }}>Registo Criminal Anexado</strong>
                    <span style={{ fontSize: '0.78rem', color: '#475569' }}>{formData.docsAnexados.registoCriminalDoc.name}</span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={32} color="#c59b27" />
                    <strong style={{ fontSize: '0.9rem' }}>Certificado de Registo Criminal</strong>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Emissão válida nos últimos 90 dias</span>
                    <span style={{ fontSize: '0.75rem', color: '#c59b27', fontWeight: 700 }}>Carregar Ficheiro</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ETAPA 5: REVISÃO & SUBMISSÃO */}
        {currentStep === 5 && (
          <div className="form-section-card">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--portal-text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={24} color="#c59b27" /> Revisão dos Dados e Submissão Oficial
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--portal-text-muted)', marginBottom: '1.5rem' }}>
              Confirme atentamente todas as informações antes de finalizar a submissão.
            </p>

            {/* RESUMO DOS DADOS */}
            <div style={{ backgroundColor: 'var(--portal-card-inner)', border: '1px solid var(--portal-border)', borderRadius: '12px', padding: '1.4rem', marginBottom: '1.6rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.88rem' }}>
                <div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--portal-text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Vaga Seleccionada</span>
                  <p style={{ fontWeight: 800, color: 'var(--portal-text-main)', fontSize: '1rem' }}>{vagaEscolhida.titulo}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800 }}>Edital de Abertura</span>
                  <p style={{ fontWeight: 800, color: '#b0891e' }}>{vagaEscolhida.codigoEdital}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800 }}>Candidato</span>
                  <p style={{ fontWeight: 700 }}>{formData.nomeCompleto}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800 }}>BI / NUIT</span>
                  <p style={{ fontWeight: 700 }}>{formData.biNumero} • NUIT: {formData.nuit}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800 }}>Contacto Telefónico / E-mail</span>
                  <p style={{ fontWeight: 700 }}>{formData.telefonePrincipal} • {formData.email}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800 }}>Habilitações Literárias</span>
                  <p style={{ fontWeight: 700 }}>{formData.nivelAcademico} em {formData.cursoNome || 'Não especificado'}</p>
                </div>
              </div>
            </div>

            {/* DECLARAÇÃO DE HONRA */}
            <div style={{ backgroundColor: '#fef7e7', border: '1px solid #f2d184', borderRadius: '10px', padding: '1.2rem', marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', cursor: 'pointer', fontSize: '0.86rem', color: '#451a03', lineHeight: 1.5 }}>
                <input
                  type="checkbox"
                  name="declaracaoVeracidade"
                  checked={formData.declaracaoVeracidade}
                  onChange={handleChange}
                  style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: '#c59b27' }}
                />
                <span>
                  <strong>Declaração de Compromisso e Honra:</strong> Declaro por minha honra que todas as informações prestadas neste formulário e documentos anexados correspondem rigorosamente à verdade e que possuo idoneidade cívica e moral para o exercício de funções de investigação criminal nos termos da lei. Estou ciente de que falsas declarações implicam a anulação imediata da candidatura e sanções penais.
                </span>
              </label>
              {errors.declaracaoVeracidade && (
                <div style={{ marginTop: '0.5rem', color: '#c32026', fontSize: '0.8rem', fontWeight: 700 }}>
                  {errors.declaracaoVeracidade}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. CONTROLOS DE NAVEGAÇÃO DO STEPPER */}
      <div className="form-stepper-footer">
        <div>
          {currentStep > 1 && (
            <button
              type="button"
              className="btn-draft"
              onClick={handlePrevStep}
            >
              <ArrowLeft size={16} />
              <span>Etapa Anterior</span>
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.8rem' }}>
          {currentStep < 5 ? (
            <button
              type="button"
              className="btn-next-step"
              onClick={handleNextStep}
            >
              <span>Continuar</span>
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              className="btn-submit-candidatura"
              onClick={handleSubmitCandidatura}
              disabled={isSubmitting}
            >
              <ShieldCheck size={20} />
              <span>{isSubmitting ? 'A Processar Submissão...' : 'Submeter Candidatura Oficial'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
