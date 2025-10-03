import PropTypes from 'prop-types';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Stack from 'react-bootstrap/Stack';
import MainCard from 'components/MainCard';

export default function SalesPerformanceCard({ title, sales, profit, progress }) {
  const designationId = sessionStorage.getItem('designation_id');
  const isSalesman = designationId === '8';

  return (
    <MainCard>
      <Stack className="gap-3">
        <h6 className="mb-0 text-center">{title}</h6>

        <Stack direction="horizontal" className="justify-content-between align-items-center flex-wrap">
          {/* Sales Block */}
          <Stack direction="vertical" className="align-items-center text-center mb-2">
            <div className="text-muted small mb-1">Sales</div>
            <Stack direction="horizontal" className="align-items-center gap-2">
              {/* <i className={`${sales.icon} f-24 text-success`} /> */}
              <h5 className="mb-0">{sales.amount}</h5>
            </Stack>
          </Stack>

          {/* Profit Block - Hidden for Salesman */}
          {!isSalesman && (
            <Stack direction="vertical" className="align-items-center text-center mb-2">
              <div className="text-muted small mb-1">Profit</div>
              <Stack direction="horizontal" className="align-items-center gap-2">
                {/* <i className={`${profit.icon} f-24 text-warning`} /> */}
                <h5 className="mb-0">{profit.amount}</h5>
              </Stack>
            </Stack>
          )}
        </Stack>

        {/* Progress Bar - Adjusted for Salesman */}
        <div style={{ marginTop: '0px' }}>
          <ProgressBar animated>
            <ProgressBar
              now={progress.salesPercent}
              className="bg-brand-color-1"
              key={1}
            />
            {!isSalesman && (
              <ProgressBar
                now={progress.profitPercent}
                className="bg-brand-color-2"
                key={2}
              />
            )}
          </ProgressBar>
        </div>
      </Stack>
    </MainCard>
  );
}

SalesPerformanceCard.propTypes = {
  title: PropTypes.string.isRequired,
  sales: PropTypes.shape({
    icon: PropTypes.string.isRequired,
    amount: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
  }).isRequired,
  profit: PropTypes.shape({
    icon: PropTypes.string.isRequired,
    amount: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
  }).isRequired,
  progress: PropTypes.shape({
    salesPercent: PropTypes.number.isRequired,
    profitPercent: PropTypes.number.isRequired,
  }).isRequired,
};