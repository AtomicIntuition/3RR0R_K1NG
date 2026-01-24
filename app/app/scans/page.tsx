import { redirect } from 'next/navigation';

export default function ScansPage() {
  // Redirect to dashboard which shows all scans
  redirect('/dashboard');
}
