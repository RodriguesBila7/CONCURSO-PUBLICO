import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  UserCheck,
  AlertTriangle,
  Lock,
  Clock,
  CalendarX,
  XCircle
} from 'lucide-react';
import { 
  INITIAL_VAGAS, 
  getStoredVagas,
  isPrazoSubmissaoExpirado,
  formatarDataLimiteExtenso,
  getStatusEfetivoVaga,
  PROVINCIAS_MOCAMBIQUE, 
  PROVINCIAS_GEOGRAFICAS,
  validarNUIT, 
  validarBI, 
  validarTelefoneMZ,
  formatTelefoneMZInput,
  getStoredCandidaturas,
  saveStoredCandidaturas,
  addStoredAuditoria,
  getCandidatePhotoUrl,
  getDefaultValidacaoFacial,
  CANDIDATO_PHOTOS_MALE,
  CANDIDATO_PHOTOS_FEMALE
} from '../mockData';
import sernicLogo from '../../assets/sernic-logo.png';
import ComprovativoInscricaoDocument from '../components/ComprovativoInscricaoDocument';

const STORAGE_DRAFT_KEY = 'sernic_candidatura_draft_v1';

const MAX_DOC_BYTES = 5 * 1024 * 1024;
const TIPOS_DOC_PERMITIDOS = ['application/pdf', 'image/jpeg', 'image/png'];
const EXTENSOES_DOC_PERMITIDAS = /\.(pdf|jpe?g|png)$/i;

const DOCUMENTOS_OBRIGATORIOS = [
  { key: 'biDoc', label: 'Bilhete de Identidade (BI)', erro: 'O documento de identificação (BI/Passaporte) é obrigatório.' },
  { key: 'certificadoDoc', label: 'Certificado de Habilitações', erro: 'O certificado de habilitações é obrigatório.' },
  { key: 'cvDoc', label: 'Curriculum Vitae (CV)', erro: 'O Curriculum Vitae é obrigatório.' },
  { key: 'registoCriminalDoc', label: 'Certificado de Registo Criminal', erro: 'O certificado de registo criminal é obrigatório.' },
  { key: 'fotoDoc', label: 'Fotografia tipo passe', erro: 'A fotografia tipo passe é estritamente obrigatória para validação biométrica e reconhecimento facial.' }
];

function validarFicheiroDocumento(file) {
  if (!TIPOS_DOC_PERMITIDOS.includes(file.type) || !EXTENSOES_DOC_PERMITIDAS.test(file.name)) {
    return 'Formato não permitido. Envie apenas ficheiros PDF, JPG ou PNG.';
  }
  if (file.size === 0) return 'O ficheiro seleccionado está vazio.';
  if (file.size > MAX_DOC_BYTES) return 'O ficheiro excede o tamanho máximo de 5 MB.';
  return null;
}

function sanitizarNomeFicheiro(nome) {
  return String(nome).replace(/[^\w.\- ]+/g, '_').slice(0, 120);
}

function formatarTamanhoFicheiro(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getDocumentosEmFalta(docs) {
  return DOCUMENTOS_OBRIGATORIOS.filter(d => !docs || !docs[d.key]);
}

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

  // Vagas sincronizadas com o repositório central e eventos do sistema
  const [vagasDisponiveis, setVagasDisponiveis] = useState(() => getStoredVagas());

  useEffect(() => {
    const handleSync = () => setVagasDisponiveis(getStoredVagas());
    window.addEventListener('sernic-vagas-updated', handleSync);
    return () => window.removeEventListener('sernic-vagas-updated', handleSync);
  }, []);

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

    // Passo 3: Contactos & Residência (Padrão +258 com prefixo fixo)
    telefonePrincipal: currentUser ? (currentUser.telefone || '+258 000 000 000') : '+258 000 000 000',
    telefoneAlternativo: '+258 000 000 000',
    email: currentUser ? (currentUser.email || '').toUpperCase() : '',
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

  // Vaga atualmente selecionada
  const vagaAtiva = useMemo(() => {
    return vagasDisponiveis.find(v => v.id === formData.vagaId) || vagasDisponiveis[0] || null;
  }, [vagasDisponiveis, formData.vagaId]);

  // Verificação estrita se o prazo de submissão de documentos / candidatura expirou
  const isPrazoExpirado = useMemo(() => {
    return vagaAtiva ? isPrazoSubmissaoExpirado(vagaAtiva.dataLimite) : false;
  }, [vagaAtiva]);

  // Manipular alteração de inputs de texto com padrão em MAIÚSCULAS e detecção de GÊNERO
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let processedValue = value;

    if (type === 'checkbox') {
      processedValue = checked;
    } else if (name === 'genero') {
      processedValue = value;
    } else if (name === 'telefonePrincipal' || name === 'telefoneAlternativo') {
      processedValue = formatTelefoneMZInput(value);
    } else if (typeof value === 'string' && type !== 'date') {
      // Conversão padrão automática para letras maiúsculas em todos os campos, incluindo correio eletrónico
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

  // Protege o prefixo "+258 " para não ser apagado pelo utilizador
  const handlePhoneKeyDown = (e) => {
    if (e.key === 'Backspace' && e.target.selectionStart <= 5 && e.target.selectionEnd <= 5) {
      e.preventDefault();
    }
    if (e.key === 'Delete' && e.target.selectionStart < 5) {
      e.preventDefault();
    }
  };

  // Ao focar, se estiver com os zeros padrão "+258 000 000 000", seleciona os zeros para edição imediata
  const handlePhoneFocus = (e) => {
    if (e.target.value === '+258 000 000 000') {
      setTimeout(() => {
        try {
          e.target.setSelectionRange(5, 16);
        } catch {
          // ignore
        }
      }, 20);
    }
  };

  const fileInputRef = useRef(null);
  const pendingDocKeyRef = useRef(null);

  const handleFileUpload = (docKey) => {
    if (isPrazoExpirado) {
      const msg = `Submissão Bloqueada: O prazo legal para envio de documentos para "${vagaAtiva?.titulo}" expirou em ${formatarDataLimiteExtenso(vagaAtiva?.dataLimite)}.`;
      if (onNotify) {
        onNotify('error', msg);
      } else {
        alert(`⚠️ SUBMISSÃO BLOQUEADA:\n\n${msg}\n\nO sistema encontra-se encerrado para novas submissões de documentos.`);
      }
      return;
    }
    pendingDocKeyRef.current = docKey;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = (e) => {
    const file = e.target.files && e.target.files[0];
    const docKey = pendingDocKeyRef.current;
    pendingDocKeyRef.current = null;
    if (!file || !docKey) return;

    const erro = validarFicheiroDocumento(file);
    if (erro) {
      setErrors(prev => ({ ...prev, [docKey]: erro }));
      if (onNotify) onNotify('error', erro);
      return;
    }

    setFormData(prev => ({
      ...prev,
      docsAnexados: {
        ...prev.docsAnexados,
        [docKey]: {
          name: sanitizarNomeFicheiro(file.name),
          size: formatarTamanhoFicheiro(file.size),
          type: file.type,
          date: new Date().toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        }
      }
    }));
    setErrors(prev => ({ ...prev, [docKey]: null }));
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

      // Validação de unicidade estrita: Cada candidato é único, sem repetições
      const candidaturasExistentes = getStoredCandidaturas();
      const biLimpo = String(formData.biNumero || '').trim().toUpperCase();
      const nuitLimpo = String(formData.nuit || '').trim();

      const duplicadoPorBI = candidaturasExistentes.find(c => 
        c.biNumero && String(c.biNumero).trim().toUpperCase() === biLimpo
      );
      if (duplicadoPorBI) {
        newErrors.biNumero = `Este Bilhete de Identidade já possui a candidatura n.º ${duplicadoPorBI.codigoCandidatura} registada (${duplicadoPorBI.vagaTitulo || 'Concurso'}). Cada candidato é único e não são permitidas duplicações.`;
      }

      const duplicadoPorNuit = candidaturasExistentes.find(c => 
        c.nuit && String(c.nuit).trim() === nuitLimpo
      );
      if (duplicadoPorNuit && !duplicadoPorBI) {
        newErrors.nuit = `Este NUIT já possui a candidatura n.º ${duplicadoPorNuit.codigoCandidatura} registada. Cada candidato é único no concurso público.`;
      }

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
      if (isPrazoExpirado) {
        newErrors.vagaId = `O prazo legal para submissão de documentos desta carreira encerrou a ${formatarDataLimiteExtenso(vagaAtiva?.dataLimite)}. Selecione uma vaga aberta para poder avançar.`;
      }
      if (!formData.cursoNome.trim()) newErrors.cursoNome = 'Informe o curso ou área de formação.';
      if (!formData.instituicaoEnsino.trim()) newErrors.instituicaoEnsino = 'Informe a instituição de ensino.';
    }

    if (step === 3) {
      if (!validarTelefoneMZ(formData.telefonePrincipal)) {
        newErrors.telefonePrincipal = 'Informe um número de telefone moçambicano válido (ex: +258 000 000 000).';
      }
      if (!formData.email.trim() || !formData.email.includes('@')) {
        newErrors.email = 'Informe um endereço de e-mail válido para receber notificações.';
      }
      if (!formData.distritoResidencia.trim()) {
        newErrors.distritoResidencia = 'Informe o município ou distrito.';
      }
    }

    if (step === 4) {
      if (isPrazoExpirado) {
        newErrors.biDoc = `Submissão de documentos bloqueada: O prazo regulamentar expirou a ${formatarDataLimiteExtenso(vagaAtiva?.dataLimite)}.`;
      }
      getDocumentosEmFalta(formData.docsAnexados).forEach(d => {
        if (!newErrors[d.key]) newErrors[d.key] = d.erro;
      });
    }

    if (step === 5) {
      const emFalta = getDocumentosEmFalta(formData.docsAnexados);
      if (emFalta.length > 0) {
        newErrors.declaracaoVeracidade = `Documentos obrigatórios em falta: ${emFalta.map(d => d.label).join(', ')}. Volte à Etapa 4 para os anexar.`;
      }
      if (isPrazoExpirado) {
        newErrors.declaracaoVeracidade = `Submissão bloqueada pelo sistema: O prazo legal deste concurso expirou a ${formatarDataLimiteExtenso(vagaAtiva?.dataLimite)}.`;
      }
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
    // Bloqueio rigoroso de prazo legal
    if (isPrazoExpirado) {
      const aviso = `⚠️ SUBMISSÃO RECUSADA PELO SISTEMA (EXTEMPORANEIDADE):\n\nO prazo legal para submissão de documentos e formalização de candidatura para "${vagaAtiva?.titulo}" encerrou impreterivelmente a ${formatarDataLimiteExtenso(vagaAtiva?.dataLimite)}.\n\nNos termos do Estatuto Geral dos Funcionários e Agentes do Estado (EGFAE) e do Regulamento do SERNIC, o sistema encontra-se bloqueado e não aceita mais submissões fora de prazo.`;
      alert(aviso);
      if (onNotify) onNotify('error', 'Submissão recusada: O prazo regulamentar para envio de documentos desta vaga já expirou.');
      return;
    }

    if (!validateStep(5)) return;

    // Dupla verificação de segurança contra repetições de candidatos
    const candidaturasExistentes = getStoredCandidaturas();
    const biLimpo = String(formData.biNumero || '').trim().toUpperCase();
    const nuitLimpo = String(formData.nuit || '').trim();
    const duplicado = candidaturasExistentes.find(c => 
      (c.biNumero && String(c.biNumero).trim().toUpperCase() === biLimpo) ||
      (c.nuit && String(c.nuit).trim() === nuitLimpo)
    );

    if (duplicado) {
      alert(`⚠️ CANDIDATO JÁ REGISTADO NO CONCURSO PÚBLICO:\n\nJá se encontra registada no sistema a candidatura n.º ${duplicado.codigoCandidatura} em nome de "${duplicado.nomeCompleto}" (BI: ${duplicado.biNumero}).\n\nRegra Regulamentar: Cada candidato é único e não são permitidas repetições ou duplicações de candidaturas.`);
      return;
    }

    setIsSubmitting(true);
    const vagaSelecionada = vagasDisponiveis.find(v => v.id === formData.vagaId) || vagasDisponiveis[0] || INITIAL_VAGAS[0];
    
    // Gerar número de candidato sequencial 00001 assim em diante
    const listaAtual = getStoredCandidaturas();
    let maxNum = listaAtual.length;
    listaAtual.forEach(c => {
      if (c.numeroCandidato) {
        const val = parseInt(c.numeroCandidato, 10);
        if (!isNaN(val) && val > maxNum) maxNum = val;
      }
    });
    const seqNum = maxNum + 1;
    const numeroCandidatoFormatado = String(seqNum).padStart(5, '0');
    const codigoCandidaturaGerado = `SERNIC-2026-REC-${numeroCandidatoFormatado}`;
    const dataSubmissaoISO = new Date().toISOString();
    const dataSubmissaoFormatada = new Date().toLocaleDateString('pt-MZ') + ' às ' + new Date().toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' });
    const chaveAuth = 'MZ-SERNIC-AUTH-' + Math.floor(100000 + Math.random() * 900000);

    const payload = {
      codigoCandidatura: codigoCandidaturaGerado,
      numeroCandidato: numeroCandidatoFormatado,
      nuit: formData.nuit,
      nomeCompleto: formData.nomeCompleto,
      bi: formData.biNumero,
      email: formData.email,
      telefone: formData.telefonePrincipal,
      carreira: vagaSelecionada.titulo,
      nivelAcademico: `${formData.nivelAcademico} em ${formData.cursoNome}`,
      provincia: formData.provinciaResidencia,
      dataSubmissao: dataSubmissaoISO
    };

    const codigoFinal = codigoCandidaturaGerado;

    // Persistir novo candidato diretamente para visualização imediata no módulo Inscritos no Concurso
    const novoCandidato = {
      numeroCandidato: numeroCandidatoFormatado,
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
      dataSubmissao: dataSubmissaoISO,
      status: 'Submetida (Em Análise Documental)',
      faseAtual: 1,
      habilitacoes: {
        grau: formData.nivelAcademico,
        curso: formData.cursoNome,
        instituicao: formData.instituicaoEnsino,
        anoConclusao: formData.anoConclusao,
        mediaFinal: formData.mediaFinal || '14.5'
      },
      documentos: DOCUMENTOS_OBRIGATORIOS.filter(d => d.key !== 'fotoDoc').map(d => ({
        id: `doc-${d.key}`,
        tipo: d.label,
        ficheiro: formData.docsAnexados[d.key].name,
        status: 'Sob Análise',
        tamanho: formData.docsAnexados[d.key].size,
        data: new Date().toISOString().split('T')[0]
      })),
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
      saveStoredCandidaturas([novoCandidato, ...listaAtual]);
      addStoredAuditoria({
        acao: 'Nova Inscrição no Concurso',
        candidato: `${novoCandidato.nomeCompleto} (${novoCandidato.codigoCandidatura})`,
        estadoAnterior: 'Sem inscrição',
        novoEstado: 'Submetida (Em Análise Documental)',
        motivo: `Candidatura n.º ${numeroCandidatoFormatado} submetida para ${novoCandidato.vagaTitulo} (${novoCandidato.provincia})`,
        operador: 'Sistema SERNIC (Portal do Candidato)'
      });
    } catch (err) {
      console.warn('Erro ao salvar candidatura em localStorage', err);
    }

    try {
      const res = await fetch('/api/candidaturas/solicitar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, processo: novoCandidato })
      });
      const data = await res.json();
      if (data.success) {
        setSubmissionSuccess({
          codigo: data.codigoCandidatura || codigoFinal,
          numeroCandidato: numeroCandidatoFormatado,
          dados: payload,
          vaga: vagaSelecionada,
          dataTexto: dataSubmissaoFormatada,
          chaveAuth,
          candidatoCompleto: novoCandidato
        });
      } else {
        setSubmissionSuccess({
          codigo: codigoFinal,
          numeroCandidato: numeroCandidatoFormatado,
          dados: payload,
          vaga: vagaSelecionada,
          dataTexto: dataSubmissaoFormatada,
          chaveAuth,
          candidatoCompleto: novoCandidato
        });
      }
    } catch {
      setSubmissionSuccess({
        codigo: codigoFinal,
        numeroCandidato: numeroCandidatoFormatado,
        dados: payload,
        vaga: vagaSelecionada,
        dataTexto: dataSubmissaoFormatada,
        chaveAuth,
        candidatoCompleto: novoCandidato
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

        {/* COMPROVATIVO OFICIAL CONFORME O MODELO OFICIAL SERNIC */}
        <div style={{ marginTop: '1.5rem' }}>
          <ComprovativoInscricaoDocument 
            candidato={submissionSuccess.candidatoCompleto || {
              nomeCompleto: formData.nomeCompleto,
              genero: formData.genero,
              numeroCandidato: submissionSuccess.numeroCandidato,
              vagaTitulo: submissionSuccess.vaga?.titulo,
              carreira: submissionSuccess.vaga?.carreira || submissionSuccess.vaga?.titulo,
              dataSubmissao: submissionSuccess.dataTexto,
              status: 'Submetida (Em Análise Documental)'
            }}
            showActions={false}
            embedded={true}
          />
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
        {/* BANNER REGULAMENTAR DE BLOQUEIO POR PRAZO EXPIRADO */}
        {isPrazoExpirado && (
          <div className="submissao-expirada-banner">
            <div className="banner-icon-col">
              <Lock size={28} color="#dc2626" />
            </div>
            <div className="banner-text-col">
              <h4>SUBMISSÕES ENCERRADAS • PRAZO LEGAL EXPIRADO</h4>
              <p>
                O prazo legal para submissão de documentos e candidatura à carreira de <strong>{vagaAtiva?.titulo}</strong> ({vagaAtiva?.codigoEdital}) encerrou improrrogavelmente a <strong>{formatarDataLimiteExtenso(vagaAtiva?.dataLimite)}</strong>.
              </p>
              <span className="banner-legal-note">
                Em estrito cumprimento ao Estatuto Geral dos Funcionários e Agentes do Estado (EGFAE) e ao Regulamento de Concursos do SERNIC, o sistema encontra-se bloqueado e não aceita mais submissões de documentos. Caso pretenda concorrer a outra carreira que ainda esteja aberta, selecione outra vaga na <strong>Etapa 2 (Habilitações)</strong>.
              </span>
            </div>
          </div>
        )}

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
                  placeholder="Ex: Armando Carlos Mondlane"
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
                  placeholder="Ex: 123456789"
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
                  placeholder="Ex: 000000000000M"
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
                <label>Província de Nascimento (Naturalidade) <span className="required">*</span></label>
                <select name="provinciaNaturalidade" className="form-select" value={formData.provinciaNaturalidade} onChange={handleChange}>
                  {PROVINCIAS_GEOGRAFICAS.map(p => (
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
                className={`form-select ${errors.vagaId || isPrazoExpirado ? 'error' : ''}`}
                value={formData.vagaId} 
                onChange={handleChange}
              >
                {vagasDisponiveis.map(v => {
                  const expirada = isPrazoSubmissaoExpirado(v.dataLimite);
                  return (
                    <option key={v.id} value={v.id}>
                      {v.titulo} ({v.codigoEdital}) • {v.vagas} Vagas • Prazo: {new Date(v.dataLimite).toLocaleDateString('pt-MZ')}{expirada ? ' ⚠️ [SUBMISSÕES ENCERRADAS - PRAZO EXPIRADO]' : ' [ABERTO]'}
                    </option>
                  );
                })}
              </select>
              {isPrazoExpirado && (
                <div className="vaga-expirada-inline-warning">
                  <AlertTriangle size={15} color="#dc2626" />
                  <span><strong>Submissões Fechadas:</strong> O prazo desta carreira encerrou a {formatarDataLimiteExtenso(vagaAtiva?.dataLimite)}. Por favor escolha outra vaga com prazo aberto para poder submeter a sua candidatura.</span>
                </div>
              )}
              {errors.vagaId && <span className="form-error-msg">{errors.vagaId}</span>}
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
                  placeholder="Ex: Direito, Ciências Policiais, Informática..."
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
                  placeholder="Ex: UEM, ACIPOL, ISCISA, UDM..."
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
                  className={`form-input ${formData.telefonePrincipal === '+258 000 000 000' ? 'input-example-val' : ''} ${errors.telefonePrincipal ? 'error' : ''}`}
                  placeholder="+258 000 000 000"
                  value={formData.telefonePrincipal}
                  onChange={handleChange}
                  onKeyDown={handlePhoneKeyDown}
                  onFocus={handlePhoneFocus}
                />
                {errors.telefonePrincipal && <span className="form-error-msg">{errors.telefonePrincipal}</span>}
              </div>

              <div className="form-group">
                <label>Telefone Alternativo</label>
                <input
                  type="tel"
                  name="telefoneAlternativo"
                  className={`form-input ${formData.telefoneAlternativo === '+258 000 000 000' ? 'input-example-val' : ''}`}
                  placeholder="+258 000 000 000"
                  value={formData.telefoneAlternativo}
                  onChange={handleChange}
                  onKeyDown={handlePhoneKeyDown}
                  onFocus={handlePhoneFocus}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Correio Eletrónico (E-mail) <span className="required">*</span></label>
                <input
                  type="email"
                  name="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="Ex: SEU.NOME@EXEMPLO.MZ"
                  value={formData.email}
                  onChange={handleChange}
                  style={{ textTransform: 'uppercase' }}
                />
                {errors.email && <span className="form-error-msg">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label>Província de Residência <span className="required">*</span></label>
                <select name="provinciaResidencia" className="form-select" value={formData.provinciaResidencia} onChange={handleChange}>
                  {PROVINCIAS_GEOGRAFICAS.map(p => (
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
                  placeholder="Ex: KaMpfumo, Matola, Beira, Nampula..."
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
                  placeholder="Ex: Bairro Central, Rua das Flores n.º 45"
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
            <p style={{ fontSize: '0.85rem', color: 'var(--portal-text-muted)', marginBottom: '1.2rem' }}>
              Carregue os ficheiros em formato PDF ou imagem (JPG/PNG). Tamanho máximo: 5 MB por documento.
            </p>

            {isPrazoExpirado && (
              <div className="docs-blocked-deadline-notice">
                <Lock size={18} color="#dc2626" />
                <span><strong>Submissão de Documentos Bloqueada:</strong> O prazo limite para a carreira de "{vagaAtiva?.titulo}" encerrou a <strong>{formatarDataLimiteExtenso(vagaAtiva?.dataLimite)}</strong>. Novos documentos não são admitidos nos termos do EGFAE.</span>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              onChange={handleFileSelected}
              style={{ display: 'none' }}
            />

            {(() => {
              const total = DOCUMENTOS_OBRIGATORIOS.length;
              const emFalta = getDocumentosEmFalta(formData.docsAnexados).length;
              return (
                <div className={`docs-progress ${emFalta === 0 ? 'complete' : ''}`} role="status">
                  <strong>{total - emFalta} de {total} documentos obrigatórios anexados</strong>
                  <span>{emFalta === 0 ? 'Pode avançar para a revisão.' : 'Todos os documentos assinalados com * são obrigatórios para submeter a candidatura.'}</span>
                </div>
              );
            })()}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
              {DOCUMENTOS_OBRIGATORIOS.filter(d => d.key !== 'fotoDoc').map(doc => {
                const anexo = formData.docsAnexados[doc.key];
                return (
                  <button
                    type="button"
                    key={doc.key}
                    className={`doc-upload-box ${anexo ? 'uploaded' : ''} ${isPrazoExpirado ? 'disabled-expired' : ''} ${errors[doc.key] ? 'has-error' : ''}`}
                    onClick={() => handleFileUpload(doc.key)}
                    disabled={isPrazoExpirado}
                    aria-label={`${doc.label}: ${anexo ? 'substituir ficheiro' : 'carregar ficheiro'}`}
                  >
                    {anexo ? <FileCheck size={30} className="doc-upload-icon ok" /> : <UploadCloud size={30} className="doc-upload-icon" />}
                    <strong className="doc-upload-title">{doc.label} <span className="doc-required">*</span></strong>
                    {anexo ? (
                      <span className="doc-upload-meta">{anexo.name} · {anexo.size}</span>
                    ) : (
                      <span className="doc-upload-meta">PDF, JPG ou PNG · até 5 MB</span>
                    )}
                    <span className="doc-upload-action">
                      {isPrazoExpirado ? 'Prazo expirado' : anexo ? 'Substituir ficheiro' : 'Carregar ficheiro'}
                    </span>
                    {errors[doc.key] && <span className="form-error-msg">{errors[doc.key]}</span>}
                  </button>
                );
              })}
              {/* Doc 4: Fotografia Obrigatória com Biometria e Análise Facial */}
              <div 
                className={`doc-upload-box biometric-upload-card ${formData.docsAnexados.fotoDoc ? 'uploaded' : ''} ${isPrazoExpirado ? 'disabled-expired' : ''}`}
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
                  <span style={{ fontSize: '0.74rem', color: 'var(--portal-text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Edital de Abertura</span>
                  <p style={{ fontWeight: 800, color: 'var(--portal-gold)' }}>{vagaEscolhida.codigoEdital}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--portal-text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Candidato</span>
                  <p style={{ fontWeight: 700 }}>{formData.nomeCompleto}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--portal-text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>BI / NUIT</span>
                  <p style={{ fontWeight: 700 }}>{formData.biNumero} • NUIT: {formData.nuit}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--portal-text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Contacto Telefónico / E-mail</span>
                  <p style={{ fontWeight: 700 }}>{formData.telefonePrincipal} • {formData.email}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--portal-text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Habilitações Literárias</span>
                  <p style={{ fontWeight: 700 }}>{formData.nivelAcademico} em {formData.cursoNome || 'Não especificado'}</p>
                </div>
              </div>
            </div>

            {/* AVISO LEGAL E CRIMINAL */}
            <div style={{
              backgroundColor: '#fff1f2',
              border: '2px solid #fda4af',
              borderRadius: '12px',
              padding: '1.4rem 1.6rem',
              marginBottom: '1.4rem',
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start'
            }}>
              <div style={{
                backgroundColor: '#ffe4e6',
                color: '#e11d48',
                borderRadius: '50%',
                padding: '0.6rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <AlertTriangle size={26} color="#e11d48" />
              </div>
              <div>
                <h4 style={{
                  margin: '0 0 0.4rem 0',
                  color: '#9f1239',
                  fontSize: '1rem',
                  fontWeight: 900,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  Aviso Legal de Responsabilidade Criminal (República de Moçambique)
                </h4>
                <p style={{
                  margin: 0,
                  fontSize: '0.92rem',
                  color: '#881337',
                  lineHeight: 1.55,
                  fontWeight: 500
                }}>
                  O Serviço Nacional de Investigação Criminal (SERNIC) adverte que a prestação de falsas declarações ou falsificação de dados de identificação pessoal e académica constitui crime público com processo criminal obrigatório. Todos os dados submetidos são cruzados electronicamente com as bases centrais de Identificação Civil e Registo Criminal.
                </p>
              </div>
            </div>

            {/* DECLARAÇÃO DE COMPROMISSO E HONRA */}
            <div style={{
              backgroundColor: '#fefce8',
              border: '2px solid #facc15',
              borderRadius: '12px',
              padding: '1.6rem 1.8rem',
              marginBottom: '1.8rem',
              boxShadow: '0 2px 8px rgba(202, 138, 4, 0.1)'
            }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', cursor: 'pointer', fontSize: '0.98rem', color: '#422006', lineHeight: 1.65 }}>
                <input
                  type="checkbox"
                  name="declaracaoVeracidade"
                  checked={formData.declaracaoVeracidade}
                  onChange={handleChange}
                  style={{ width: '22px', height: '22px', marginTop: '3px', accentColor: '#c59b27', flexShrink: 0, cursor: 'pointer' }}
                />
                <span>
                  <strong style={{ fontSize: '1.05rem', color: '#713f12', display: 'block', marginBottom: '0.35rem' }}>
                    Declaração Solene de Compromisso e Honra:
                  </strong>
                  Declaro por minha honra que todas as informações prestadas neste formulário e respectivos documentos anexados correspondem rigorosamente à verdade, assumindo plena idoneidade cívica e moral para o exercício de funções de investigação criminal.
                  <br /><br />
                  Estou plenamente ciente de que a falsificação de identidade, de documentos autênticos ou a prestação de declarações falsas perante autoridade pública constitui crime previsto e punido nos termos dos <strong>Artigos 306.º e 310.º do Código Penal Moçambicano (Lei n.º 24/2019 de 24 de Dezembro)</strong> com <strong>pena de prisão maior de 2 a 8 anos e multa correspondente</strong>, determinando a anulação imediata e irrevogável da candidatura, o encaminhamento obrigatório ao Ministério Público para procedimento penal e a inabilitação definitiva para ingresso na Função Pública e no SERNIC (nos termos da Lei n.º 4/2022 - EGFAE).
                </span>
              </label>
              {errors.declaracaoVeracidade && (
                <div style={{ marginTop: '0.8rem', padding: '0.6rem 0.8rem', backgroundColor: '#fee2e2', border: '1px solid #f87171', borderRadius: '6px', color: '#b91c1c', fontSize: '0.88rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <AlertTriangle size={16} />
                  <span>{errors.declaracaoVeracidade}</span>
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
              className={`btn-submit-candidatura ${isPrazoExpirado ? 'btn-disabled-expired' : ''}`}
              onClick={handleSubmitCandidatura}
              disabled={isSubmitting || isPrazoExpirado}
              title={isPrazoExpirado ? `Submissão de documentos encerrada: Prazo expirou a ${formatarDataLimiteExtenso(vagaAtiva?.dataLimite)}` : 'Submeter Candidatura Oficial'}
            >
              {isPrazoExpirado ? <Lock size={20} /> : <ShieldCheck size={20} />}
              <span>
                {isPrazoExpirado ? 'Submissões Encerradas (Prazo Expirado)' : isSubmitting ? 'A Processar Submissão...' : 'Submeter Candidatura Oficial'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
