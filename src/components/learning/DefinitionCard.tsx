import { useI18n } from '../../i18n';
import { RichText, Tex } from '../math/Tex';
import { Card } from './UnitShell';

interface DefinitionCardProps {
  definition: string;
  intuition: string;
  /** Variables and elements: LaTeX symbol + translated description. */
  variables: Array<{ symbol: string; desc: string }>;
}

export function DefinitionCard({ definition, intuition, variables }: DefinitionCardProps) {
  const { t } = useI18n();
  return (
    <div className="def-grid">
      <Card title={t('ui.definition')} className="card--accent">
        <p className="def__text"><RichText text={definition} /></p>
        <h4 className="card__sub">{t('ui.intuition')}</h4>
        <p><RichText text={intuition} /></p>
      </Card>
      <Card title={t('ui.variables')}>
        <ul className="var-list">
          {variables.map((v, i) => (
            <li key={i}>
              <span className="var-list__sym"><Tex tex={v.symbol} /></span>
              <span><RichText text={v.desc} /></span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
