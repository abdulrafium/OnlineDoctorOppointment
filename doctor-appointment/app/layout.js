import './globals.css';
import '../styles/Responsive.css';

export const metadata = {
  title: 'Online Doctor Appointment System',
  description: 'Book appointments with doctors online. Manage your health with ease.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
