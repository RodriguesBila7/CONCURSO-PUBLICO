import React from 'react';
import { ShieldCheck, MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react';

export default function PortalFooter({ navigate }) {
  const handleNav = (path) => {
    if (typeof navigate === 'function') {
      navigate(path);
    } else if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  return (
    <footer className="portal-footer">
      <div className="portal-footer-inner">
        <div className="portal-footer-col">
          <h4>
            <ShieldCheck size={18} color="#c59b27" />
            SERVIÇO NACIONAL DE INVESTIGAÇÃO CRIMINAL
          </h4>
          <p>
            Órgão de polícia judiciária e de investigação criminal da República de Moçambique, 
            tutelado pelo Procurador-Geral da República.
          </p>
          <p style={{ color: '#cbd5e1', fontSize: '0.82rem' }}>
            Direcção Geral • Direcção de Recursos Humanos • Comissão de Júri de Recrutamento 2026.
          </p>
        </div>

        <div className="portal-footer-col">
          <h4>
            <MapPin size={18} color="#c59b27" />
            Sede e Contactos
          </h4>
          <p>
            <MapPin size={14} style={{ display: 'inline', marginRight: '5px' }} />
            Av. Vladimir Lenine, n.º 1234, Maputo, Moçambique
          </p>
          <p>
            <Phone size={14} style={{ display: 'inline', marginRight: '5px' }} />
            Linha Geral: +258 21 000 000 / +258 000 000 000
          </p>
          <p>
            <Mail size={14} style={{ display: 'inline', marginRight: '5px' }} />
            recrutamento@sernic.gov.mz
          </p>
          <p>
            <Clock size={14} style={{ display: 'inline', marginRight: '5px' }} />
            Atendimento: 2ª a 6ª feira, das 07:30 às 15:30
          </p>
        </div>

        <div className="portal-footer-col">
          <h4>
            <ExternalLink size={18} color="#c59b27" />
            Acesso Rápido
          </h4>
          <p style={{ cursor: 'pointer' }} onClick={() => handleNav('/portal-recrutamento/recrutamento')}>
            • Editais e Vagas Oficiais
          </p>
          <p style={{ cursor: 'pointer' }} onClick={() => handleNav('/portal-recrutamento/candidatura')}>
            • Submeter Nova Candidatura
          </p>
          <p style={{ cursor: 'pointer' }} onClick={() => handleNav('/portal-recrutamento/consulta')}>
            • Consulta de Listas e Estado
          </p>
          <p style={{ cursor: 'pointer' }} onClick={() => handleNav('/portal-recrutamento/login')}>
            • Área Pessoal do Candidato
          </p>
        </div>
      </div>

      <div className="portal-footer-bottom">
        <div>
          © 2026 República de Moçambique • Tutela: Procuradoria-Geral da República. Todos os direitos reservados.
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', color: '#64748b' }}>
          <span>Termos de Uso</span>
          <span>Política de Privacidade e Protecção de Dados</span>
          <span>Segurança da Informação</span>
        </div>
      </div>
    </footer>
  );
}
