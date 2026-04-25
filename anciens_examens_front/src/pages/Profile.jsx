import { UserProvider } from '../app/user/context/UserContext';
import UserProfile from '../app/user/components/UserProfile';

export default function ProfilePage() {
  return (
    <UserProvider>
      <UserProfile />
    </UserProvider>
  );
}
