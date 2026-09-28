import MainLayout from '../components/layout/MainLayout.jsx';
import './HomePage.css';

function HomePage() {
  return (
    <MainLayout>
      <div className="home-grid">
        <section className="panel home-grid__config" aria-labelledby="config-title">
          <h2 id="config-title" className="panel__title">Configuración</h2>
        </section>
        <section className="panel home-grid__orders" aria-labelledby="orders-title">
          <h2 id="orders-title" className="panel__title">Pedidos disponibles</h2>
        </section>
      </div>
    </MainLayout>
  );
}

export default HomePage;
