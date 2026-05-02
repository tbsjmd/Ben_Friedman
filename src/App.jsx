import Layout from './components/Layout';
import Hero from './components/Hero';
import Portfolio from './components/Portfolio';
import OrderSection from './components/OrderSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';

function App() {
  return (
    <Layout>
      <Hero />
      <Portfolio />
      <OrderSection />
      <ContactSection />
      <Footer />
    </Layout>
  );
}

export default App;
