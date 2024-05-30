import React, { FC, ReactNode, useState } from 'react';
import Paths from '../resources/Paths.ts';
import Landing from '../pages/Landing.tsx';
import QuestionBank from '../pages/QuestionBank.tsx';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Stringify from '../pages/Stringify.tsx';
import { AuthenticationActions, useAuthentication } from './Authentication.tsx';
import Header from './Header.tsx';
import Article from '../pages/Article.tsx';
import { Link, Typography } from '@mui/joy';
import Strings from '../resources/Strings.ts';

const Router: FC = () => {
  const authentication = useAuthentication();

  const [nav, setNav] = useState<ReactNode>();

  return <BrowserRouter>
    <Header nav={nav} />
    <Routes>
      <Route path='/' element={<Landing setNav={setNav} />} />
      <Route path={Paths.QuestionBank} element={<QuestionBank setNav={setNav} />} />
      <Route
        path={Paths.SignUp}
        element={
          authentication.isLoggedIn
            ? <Navigate to={Paths.QuestionBank} replace />
            : <Landing
              setNav={setNav}
              authenticationUIMode={'sign-up'} />
        } />
      <Route path={Paths.SignIn} element={
        authentication.isLoggedIn
          ? <Navigate to={Paths.QuestionBank} replace />
          : <Landing
            setNav={setNav}
            authenticationUIMode={'sign-in'} />
      } />
      <Route path={Paths.ResetPassword} element={
        <Landing
          setNav={setNav}
          authenticationUIMode={'reset-password'}
        />
      } />
      <Route path='/stringify' element={<Stringify />} />
      <Route path='/__/auth/action' element={
        <AuthenticationActions />
      } />
      <Route path={Paths.Terms} element={
        <Article
          setNav={setNav}
          title={Strings.Terms}
          content={
            <>
              <Typography>
                <Typography level='title-md'>1. Acceptance of Terms</Typography>
                <br />
                By accessing and using the Radiology Interview Prep. website (the "Website"), you agree to be bound by these Terms of Service (the "Terms"). If you do not agree with any part of these Terms, please refrain from using the Website.
              </Typography>
              <Typography>
                <Typography level='title-md'>2. Use of the Website</Typography>
                <br />
                The content on this Website is for general information and educational purposes only. While we strive to provide accurate and up-to-date information, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the Website or the information contained on the Website for any purpose.
              </Typography>
              <Typography>
                <Typography level='title-md'>3. User Accounts</Typography>
                <br />
                To access certain features of the Website, such as the Question Bank, you may be required to create an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You agree to provide accurate and complete information when creating your account and to update your information as necessary.
              </Typography>
              <Typography>
                <Typography level='title-md'>4. Subscription Service</Typography>
                <br />
                The Website offers a subscription service that allows users to access the Question Bank for a period of 3 months. The subscription is automatically recurring and can be cancelled at any time using the link provided on the Question Bank page. Payment for the subscription service is processed through Stripe, a third-party payment processor. By subscribing to the service, you agree to Stripe's terms and conditions.
              </Typography>
              <Typography>
                <Typography level='title-md'>5. Intellectual Property</Typography>
                <br />
                All content on the Website, including but not limited to text, graphics, logos, images, and software, is the property of Osamah Ahmad and is protected by United Kingdom and international copyright laws. You may not reproduce, modify, distribute, or create derivative works based on the content without prior written consent from Osamah Ahmad.
              </Typography>
              <Typography>
                <Typography level='title-md'>6. Privacy</Typography>
                <br />              Please refer to our Privacy Policy for information on how we collect, use, and protect your personal data.
              </Typography>
              <Typography>
                <Typography level='title-md'>7. Limitation of Liability</Typography>
                <br />
                In no event shall Osamah Ahmad be liable for any direct, indirect, incidental, consequential, or exemplary damages arising out of or in connection with your use of the Website or the subscription service.
              </Typography>
              <Typography>
                <Typography level='title-md'>8. Indemnification</Typography>
                <br />
                You agree to indemnify and hold Osamah Ahmad harmless from any claims, losses, liabilities, damages, costs, and expenses (including reasonable attorneys' fees) arising out of or in connection with your use of the Website, the subscription service, or violation of these Terms.
              </Typography>
              <Typography>
                <Typography level='title-md'>9. Governing Law</Typography>
                <br />
                These Terms shall be governed by and construed in accordance with the laws of England and Wales. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.
              </Typography>
              <Typography>
                <Typography level='title-md'> 10. Changes to the Terms</Typography>
                <br />
                Osamah Ahmad reserves the right to modify or replace these Terms at any time. It is your responsibility to check the Terms periodically for changes.
                By using the Radiology Interview Prep. website and its services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </Typography>
            </>
          } />
      } />
      <Route path={Paths.PrivacyPolicy} element={
        <Article
          setNav={setNav}
          title={Strings.PrivacyPolicy}
          content={
            <>
              <Typography>
                Effective Date: May 22, 2024
              </Typography>
              <Typography>
                Osamah Ahmad ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and disclose personal information when you use our website, Radiology Interview Prep. (the "Website"), and its associated services, including the Question Bank subscription service.
              </Typography>
              <Typography>
                <Typography level='title-md'>1. Information We Collect</Typography>
                <br />
                1.1 Personal Information: When you create an account on our Website, we may collect personal information such as your name, email address, and other contact details.
                <br />
                1.2 Payment Information: If you subscribe to our Question Bank service, your payment information, including credit card details, is collected and processed by our third-party payment processor, Stripe. We do not store your payment information on our servers.
                <br />
                1.3 Usage Data: We may collect information about how you use our Website, including your IP address, browser type, referring/exit pages, and operating system.
              </Typography>
              <Typography>
                <Typography level='title-md'>2. How We Use Your Information</Typography>
                <br />
                2.1 We use the information we collect to provide, maintain, and improve our Website and its associated services, including the Question Bank subscription service.
                <br />
                2.2 We may use your email address to send you service-related notifications, such as account verification, subscription confirmations, and payment receipts.
                <br />
                2.3 We may use aggregated and anonymized data for analytical purposes to understand and improve our Website and services.
              </Typography>
              <Typography>
                <Typography level='title-md'>3. Information Sharing and Disclosure</Typography>
                <br />
                3.1 We do not sell, trade, or rent your personal information to third parties.
                <br />
                3.2 We may share your information with trusted third-party service providers who assist us in operating our Website and providing our services, such as hosting providers and payment processors. These third parties are obligated to maintain the confidentiality and security of your information.
                <br />
                3.3 We may disclose your information if required to do so by law or if we believe that such action is necessary to comply with legal obligations, protect our rights or property, or investigate suspected fraud or security issues.
              </Typography>
              <Typography>
                <Typography level='title-md'>4. Data Security</Typography>
                <br />
                We implement reasonable security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </Typography>
              <Typography>
                <Typography level='title-md'>5. Your Rights</Typography>
                <br />
                5.1 You have the right to access, update, or delete your personal information at any time by logging into your account or contacting us at the email address provided below.
                <br />
                5.2 You can unsubscribe from our email communications at any time by clicking the "unsubscribe" link at the bottom of our emails or by contacting us directly.
                <br />
                2.3 We may use aggregated and anonymized data for analytical purposes to understand and improve our Website and services.
              </Typography>
              <Typography>
                <Typography level='title-md'>6. Third-Party Links</Typography>
                <br />
                Our Website may contain links to third-party websites or services. We are not responsible for the privacy practices or content of those third-party sites. We encourage you to read the privacy policies of any third-party websites you visit.
              </Typography>
              <Typography>
                <Typography level='title-md'>7. Children's Privacy</Typography>
                <br />
                Our Website is not intended for use by individuals under the age of 16. We do not knowingly collect personal information from children under 16. If you believe we have collected information from a child under 16, please contact us immediately.
              </Typography>
              <Typography>
                <Typography level='title-md'>8. Changes to This Privacy Policy</Typography>
                <br />
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Effective Date" at the top of the policy.
              </Typography>
              <Typography>
                <Typography level='title-md'>9. Contact Us</Typography>
                <br />
                If you have any questions or concerns about this Privacy Policy or our privacy practices, please contact us at <Link href='mailto:hello@radiologyinterviewprep.co.uk'>hello@radiologyinterviewprep.com</Link>.
              </Typography>
            </>
          } />
      } />
      <Route path={Paths.NotFound} element={<Article setNav={setNav} title='Error 404' />} />
    </Routes>
  </BrowserRouter>
}

export default Router;