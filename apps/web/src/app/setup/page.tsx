import { redirect } from 'next/navigation';

export default function SetupRedirectPage() {
  redirect('/shop-admin/setup-wizard');
}
