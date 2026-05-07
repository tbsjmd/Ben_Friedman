import Layout from './components/Layout';
import Hero from './components/Hero';
import Portfolio from './components/Portfolio';
import OrderSection from './components/OrderSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import AdditionalPayment from './components/AdditionalPayment';

function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const paymentOrder = urlParams.get('payment_order');

  if (paymentOrder) {
    return (
      <Layout>
        <AdditionalPayment />
        <Footer />
      </Layout>
    );
  }

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
