import React from 'react';
import sernicLogo from '../../assets/sernic-logo.png';
import { detectCandidateGender, getCandidateSeqNumber } from '../mockData';
import { Printer, Download, X, CheckCircle2, ShieldCheck } from 'lucide-react';

/**
 * Comprovativo Oficial de Inscrição de Candidatura - SERNIC
 * Desenvolvido em total conformidade com o modelo oficial emitido pela
 * Direcção-Geral e Direcção de Recursos Humanos do SERNIC.
 */
export default function ComprovativoInscricaoDocument({ 
  candidato, 
  onClose, 
  showActions = true,
  embedded = false 
}) {
  if (!candidato) return null;

  // 1. Identificação do candidato consoante o género (Art. 35 do EGFAE e modelo oficial)
  const isFem = detectCandidateGender(candidato) === 'Feminino';
  const prefixoDestinatario = isFem ? 'À: Candidata' : 'Ao: Candidato';

  // 2. Número de candidato sequencial (00001 assim em diante)
  const seqNum = getCandidateSeqNumber(candidato); // e.g. "00001", "00014"
  const refNum = parseInt(seqNum, 10) || 1;
  const refFormatted = `CAND${String(refNum).padStart(2, '0')}/DRH-SERNIC/2026`;

  // 3. Data de inscrição com Data e Hora de submissão
  const formatarDataHoraSubmissao = (dateVal) => {
    if (!dateVal) {
      const now = new Date();
      return `${now.toLocaleDateString('pt-MZ')} às ${now.toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' })}`;
    }
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    const dataStr = d.toLocaleDateString('pt-MZ');
    const horaStr = d.toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' });
    return `${dataStr} às ${horaStr}`;
  };

  const dataHoraInscricao = formatarDataHoraSubmissao(candidato.dataSubmissao || candidato.dataTexto);

  // 4. Data por extenso formal para assinatura do Director Geral em Maputo
  const getDataFormalExtenso = () => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const d = candidato.dataSubmissao ? new Date(candidato.dataSubmissao) : new Date();
    const dia = d.getDate();
    const mes = meses[d.getMonth()] || 'Outubro';
    const ano = d.getFullYear() || 2026;
    return `Maputo, ${dia} de ${mes} de ${ano}`;
  };

  // 5. Estado actual submetido da candidatura
  const getEstadoActualSubmetido = () => {
    if (!candidato.status || candidato.status === 'Submetida') {
      return 'Submetida (Em Análise Documental)';
    }
    return candidato.status;
  };

  const estadoActual = getEstadoActualSubmetido();

  // Vaga / cargo a que concorre
  const cargoConcorre = candidato.vagaTitulo || candidato.carreira || 'Investigador Criminal de 2ª Classe';
  const carreiraInfo = candidato.carreira && candidato.carreira !== cargoConcorre ? ` (${candidato.carreira})` : '';
  const vagaCompleta = `${cargoConcorre}${carreiraInfo}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`comprovativo-oficial-page-wrapper ${embedded ? 'embedded-mode' : ''}`}>
      {/* BARRA DE ACÇÕES NO ECRÃ (NÃO APARECE NA IMPRESSÃO) */}
      {showActions && (
        <div className="comprovativo-actions-toolbar no-print">
          <div className="toolbar-info">
            <ShieldCheck size={18} color="#c32026" />
            <div>
              <strong>Comprovativo Oficial de Inscrição de Candidatura</strong>
              <span>Documento timbrado emitido pela Direcção de Recursos Humanos do SERNIC</span>
            </div>
          </div>
          <div className="toolbar-buttons">
            <button 
              type="button" 
              className="btn-print-comprovativo" 
              onClick={handlePrint}
              title="Imprimir documento oficial ou guardar como PDF"
            >
              <Printer size={16} />
              <span>Imprimir / Salvar PDF</span>
            </button>
            {onClose && (
              <button 
                type="button" 
                className="btn-close-comprovativo" 
                onClick={onClose} 
                title="Fechar visualização"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* FOLHA OFICIAL DO COMPROVATIVO EM MODELO A4 TIMBRADO */}
      <div className="comprovativo-oficial-sheet">
        {/* 1. LOGÓTIPO INSTITUCIONAL */}
        <div className="doc-logo-center">
          <img 
            src={sernicLogo} 
            alt="Emblema Oficial do SERNIC" 
            className="doc-emblem" 
          />
        </div>

        {/* 2. CABEÇALHO INSTITUCIONAL */}
        <div className="doc-header-institutional">
          <h1>SERVIÇO NACIONAL DE INVESTIGAÇÃO CRIMINAL</h1>
          <h2>DIRECÇÃO-GERAL</h2>
          <h3>DIRECÇÃO DE RECURSOS HUMANOS</h3>
        </div>

        {/* 3. DESTINATÁRIO CONSOANTE O GÉNERO E NÚMERO DE REFERÊNCIA */}
        <div className="doc-recipient-section">
          <div className="doc-recipient-left">
            <p className="doc-recipient-title">{prefixoDestinatario}</p>
            <p className="doc-candidate-name">
              {candidato.nomeCompleto ? candidato.nomeCompleto.toUpperCase() : 'CANDIDATO'}
            </p>
          </div>
          <div className="doc-reference-right">
            <span>N.º de referência: <strong>{refFormatted}</strong></span>
          </div>
        </div>

        {/* 4. ASSUNTO */}
        <div className="doc-subject-line">
          <strong>ASSUNTO: COMPROVATIVO DE INSCRIÇÃO DE CANDIDATURA</strong>
        </div>

        {/* 5. TEXTO DECLARATÓRIO DE ABERTURA */}
        <p className="doc-body-paragraph">
          O Serviço Nacional de Investigação Criminal (SERNIC) declara, para os devidos efeitos, que 
          recebeu a inscrição de candidatura abaixo identificada no âmbito de um processo de 
          recrutamento e selecção:
        </p>

        {/* 6. CAMPOS FORMAIS CONFORME O MODELO OFICIAL */}
        <div className="doc-fields-section">
          <div className="doc-field-line">
            <span className="doc-field-label">Número de candidatura:</span>
            <span className="doc-field-value bold">{seqNum}</span>
          </div>

          <div className="doc-field-line">
            <span className="doc-field-label">Vaga/cargo a que concorre:</span>
            <span className="doc-field-value bold">{vagaCompleta}</span>
          </div>

          <div className="doc-field-line">
            <span className="doc-field-label">Data de inscrição:</span>
            <span className="doc-field-value bold">{dataHoraInscricao}</span>
          </div>

          <div className="doc-field-line">
            <span className="doc-field-label">Estado da candidatura:</span>
            <span className="doc-field-value bold doc-field-status">{estadoActual}</span>
          </div>
        </div>

        {/* 7. NOTA DE EFICÁCIA DA EMISSÃO DO COMPROVATIVO */}
        <p className="doc-statutory-paragraph">
          A emissão deste comprovativo confirma a recepção da inscrição. O estado da candidatura e a 
          sua eventual validação devem ser preenchidos de acordo com o registo e a verificação 
          efectuados pelos serviços competentes.
        </p>

        {/* 8. CUMPRIMENTOS FINAIS */}
        <p className="doc-closing-paragraph">
          Com os melhores cumprimentos.
        </p>

        {/* 9. LOCAL, DATA E ASSINATURA OFICIAL DO DIRECTOR GERAL */}
        <div className="doc-signature-block">
          <p className="doc-location-date">{getDataFormalExtenso()}</p>
          
          <div className="doc-signature-box">
            <p className="doc-signature-title">O Director Geral</p>
            
            {/* Espaço de assinatura com chancela timbrada */}
            <div className="doc-signature-space">
              <div className="doc-signature-stamp">
                <span className="stamp-entity">REPÚBLICA DE MOÇAMBIQUE</span>
                <span className="stamp-sub">SERNIC • DIRECÇÃO-GERAL</span>
                <span className="stamp-drh">RECURSOS HUMANOS</span>
              </div>
            </div>

            <p className="doc-signatory-name">Ilídio José Miguel</p>
            <p className="doc-signatory-rank">(Inspector de Investigação e Instrução Criminal Coordenador)</p>
          </div>
        </div>

        {/* 10. LINHA DE SEPARAÇÃO E RODAPÉ INSTITUCIONAL */}
        <div className="doc-footer-institutional">
          <div className="doc-footer-divider" />
          <p className="doc-footer-address">
            SERNIC – Rua John Issa, nº. 33, Maputo, 2º andar, CP.2127, Tel.21308874
          </p>
        </div>
      </div>
    </div>
  );
}
