import { sendEmailVerification, reload } from 'firebase/auth';
import { auth } from './config';

class EmailVerificationService {
  async sendVerificationEmail() {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');
    await sendEmailVerification(user);
    return { success: true };
  }

  async isEmailVerified() {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');
    return !!user.emailVerified;
  }

  async reloadCurrentUser() {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');
    await reload(user);
  }
}

const emailVerificationService = new EmailVerificationService();
export default emailVerificationService;
