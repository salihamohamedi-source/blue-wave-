const accountText = {
  en: {
    account: 'Account', myAccount: 'My account', eyebrow: 'Your Bluewave space', title: 'Your account',
    intro: 'Sign in or create an account to manage your profile.',
    introSignedIn: 'Manage your profile and security settings.',
    loginTab: 'Log in',
    signupTab: 'Create account', email: 'Email', password: 'Password', login: 'Log in',
    forgotPassword: 'Forgot your password?', displayName: 'Display name',
    passwordHint: 'Use at least 12 characters (maximum 72 UTF-8 bytes).',
    signup: 'Create account', resetRequestCopy: 'Enter your email and, if an account exists, we’ll send a secure password reset link.',
    sendReset: 'Send reset link', backToLogin: 'Back to log in',
    resetCopy: 'Choose a new password for your account.', newPassword: 'New password',
    resetPassword: 'Reset password', saveProfile: 'Save profile',
    changePassword: 'Change password', currentPassword: 'Current password',
    updatePassword: 'Update password', logout: 'Log out',
    greeting: name => `Welcome, ${name}.`,
    loading: 'Checking your account…', signedOut: 'You are signed out.',
    signupSuccess: 'Your account is ready. You are now signed in.',
    loginSuccess: 'You are now signed in.',
    profileSuccess: 'Your profile has been updated.',
    passwordSuccess: 'Your password has been updated. Other sessions have been signed out.',
    logoutSuccess: 'You have been signed out.',
    resetRequested: 'If an account exists for that email, a password reset link will arrive shortly.',
    resetSuccess: 'Your password has been reset. You can now log in with your new password.',
    invalidReset: 'This reset link is invalid or expired. Request another reset link.',
    unexpected: 'Something went wrong. Please try again.',
    passwordMismatch: 'The new password must be different from your current password.',
    serverUnavailable: 'The account service is unavailable. Please try again later.',
    localFile: 'Accounts require the website server. Install Node.js, configure the server, run npm start, then open http://127.0.0.1:3000 instead of opening index.html directly.',
    missingApi: 'This website server does not provide the account API. Restart it with the project account-enabled server using npm start.',
    backendError: 'The account server or database failed. Check the server terminal for startup errors and verify the SQLite database path is writable.',
    authRequired: 'Please log in to continue.',
    networkError: 'Could not reach the account server. Start it with npm start, open the site through its http:// server address, and check the server terminal if it still fails.',
    invalidSignup: 'Enter a valid name and email, and a password of at least 12 characters.',
    emailInUse: 'An account with this email already exists.',
    invalidCredentials: 'The email or password is incorrect.',
    invalidEmail: 'Enter a valid email address.',
    invalidPassword: 'Use a password of at least 12 characters and at most 72 UTF-8 bytes.',
    invalidResetToken: 'This reset link is invalid or expired. Request another reset link.',
    invalidDisplayName: 'Enter a display name of 1 to 60 characters.',
    invalidCurrentPassword: 'Your current password is incorrect.',
    rateLimited: 'Too many attempts. Please wait and try again.',
    resetEmailUnavailable: 'Password reset email is not configured on the website server.',
    resetEmailFailed: 'The reset email could not be sent. Please try again later.'
  },
  ar: {
    account: 'الحساب', myAccount: 'حسابي', eyebrow: 'مساحتك في بلوويف', title: 'حسابك',
    intro: 'سجّل الدخول أو أنشئ حساباً لإدارة ملفك الشخصي.',
    introSignedIn: 'أدر ملفك الشخصي وإعدادات الأمان.',
    loginTab: 'تسجيل الدخول',
    signupTab: 'إنشاء حساب', email: 'البريد الإلكتروني', password: 'كلمة المرور',
    login: 'تسجيل الدخول', forgotPassword: 'هل نسيت كلمة المرور؟', displayName: 'الاسم المعروض',
    passwordHint: 'استخدم 12 حرفاً على الأقل (بحد أقصى 72 بايت UTF-8).',
    signup: 'إنشاء حساب', resetRequestCopy: 'أدخل بريدك الإلكتروني وسنرسل رابطاً آمناً لإعادة تعيين كلمة المرور إذا كان الحساب موجوداً.',
    sendReset: 'إرسال رابط إعادة التعيين', backToLogin: 'العودة لتسجيل الدخول',
    resetCopy: 'اختر كلمة مرور جديدة لحسابك.', newPassword: 'كلمة المرور الجديدة',
    resetPassword: 'إعادة تعيين كلمة المرور', saveProfile: 'حفظ الملف الشخصي',
    changePassword: 'تغيير كلمة المرور', currentPassword: 'كلمة المرور الحالية',
    updatePassword: 'تحديث كلمة المرور', logout: 'تسجيل الخروج',
    greeting: name => `مرحباً، ${name}.`,
    loading: 'جارٍ التحقق من حسابك…', signedOut: 'تم تسجيل خروجك.',
    signupSuccess: 'تم إنشاء حسابك وتسجيل دخولك.',
    loginSuccess: 'تم تسجيل دخولك.',
    profileSuccess: 'تم تحديث ملفك الشخصي.',
    passwordSuccess: 'تم تحديث كلمة المرور وتسجيل الخروج من الجلسات الأخرى.',
    logoutSuccess: 'تم تسجيل خروجك.',
    resetRequested: 'إذا كان هناك حساب بهذا البريد الإلكتروني، فسيصلك رابط إعادة تعيين كلمة المرور قريباً.',
    resetSuccess: 'تمت إعادة تعيين كلمة المرور. يمكنك تسجيل الدخول الآن.',
    invalidReset: 'رابط إعادة التعيين غير صالح أو منتهي الصلاحية. اطلب رابطاً جديداً.',
    unexpected: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
    passwordMismatch: 'يجب أن تختلف كلمة المرور الجديدة عن الحالية.',
    serverUnavailable: 'خدمة الحسابات غير متاحة. يرجى المحاولة لاحقاً.',
    localFile: 'تتطلب الحسابات تشغيل خادم الموقع. ثبّت Node.js، وأعد إعداد الخادم، وشغّل npm start، ثم افتح http://127.0.0.1:3000 بدلاً من فتح index.html مباشرة.',
    missingApi: 'خادم الموقع هذا لا يوفر واجهة الحسابات. أعد تشغيل الخادم المتضمن لواجهة الحسابات باستخدام npm start.',
    backendError: 'تعذر على خادم الحسابات أو قاعدة البيانات العمل. راجع أخطاء بدء التشغيل في الطرفية وتأكد من إمكانية الكتابة إلى مسار قاعدة SQLite.',
    authRequired: 'يرجى تسجيل الدخول للمتابعة.',
    networkError: 'تعذر الاتصال بخادم الحسابات. شغّله باستخدام npm start وافتح الموقع عبر عنوان خادم http://، وراجع الطرفية إذا استمرت المشكلة.',
    invalidSignup: 'أدخل اسماً وبريداً إلكترونياً صالحين وكلمة مرور من 12 حرفاً على الأقل.',
    emailInUse: 'يوجد حساب مسجل بهذا البريد الإلكتروني.',
    invalidCredentials: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    invalidEmail: 'أدخل عنوان بريد إلكتروني صالحاً.',
    invalidPassword: 'استخدم كلمة مرور من 12 حرفاً على الأقل وبحد أقصى 72 بايت UTF-8.',
    invalidResetToken: 'رابط إعادة التعيين غير صالح أو منتهي الصلاحية. اطلب رابطاً جديداً.',
    invalidDisplayName: 'أدخل اسماً معروضاً من حرف إلى 60 حرفاً.',
    invalidCurrentPassword: 'كلمة المرور الحالية غير صحيحة.',
    rateLimited: 'محاولات كثيرة. يرجى الانتظار والمحاولة مرة أخرى.',
    resetEmailUnavailable: 'لم يتم إعداد البريد الإلكتروني لإعادة التعيين على خادم الموقع.',
    resetEmailFailed: 'تعذر إرسال رسالة إعادة التعيين. يرجى المحاولة لاحقاً.'
  }
};

const accountGuest = document.getElementById('account-guest');
const accountProfile = document.getElementById('account-profile');
const accountStatus = document.getElementById('account-status');
const accountNav = document.querySelector('[data-account-nav]');
const accountForms = {
  login: document.getElementById('account-login-form'),
  signup: document.getElementById('account-signup-form'),
  requestReset: document.getElementById('account-reset-request-form'),
  reset: document.getElementById('account-reset-form')
};
let accountUser = null;
let resetToken = new URLSearchParams(window.location.search).get('reset') || '';

function accountLanguage() {
  return document.documentElement.lang === 'ar' ? 'ar' : 'en';
}

function accountMessage(key, ...args) {
  const message = accountText[accountLanguage()][key];
  return typeof message === 'function' ? message(...args) : message;
}

function translateAccount() {
  const dictionary = accountText[accountLanguage()];
  document.querySelectorAll('[data-account-i18n]').forEach((element) => {
    const message = dictionary[element.dataset.accountI18n];
    if (typeof message === 'string') element.textContent = message;
  });
  accountNav.textContent = accountMessage(accountUser ? 'myAccount' : 'account');
  document.querySelector('.account-intro').textContent = accountMessage(
    accountUser ? 'introSignedIn' : 'intro'
  );
  if (accountUser) {
    document.getElementById('account-greeting').textContent = accountMessage('greeting', accountUser.displayName);
  }
}

function setAccountStatus(message, isError = false) {
  accountStatus.textContent = message;
  accountStatus.classList.toggle('is-error', isError);
}

function accountServiceError(status) {
  if (window.location.protocol === 'file:') return accountMessage('localFile');
  if (!status) return accountMessage('networkError');
  if (status === 404) return accountMessage('missingApi');
  if (status >= 500) return accountMessage('backendError');
  return accountMessage('serverUnavailable');
}

function showAccountForm(name) {
  Object.entries(accountForms).forEach(([key, form]) => {
    form.hidden = key !== name;
  });
  document.getElementById('account-show-login').setAttribute('aria-pressed', String(name === 'login'));
  document.getElementById('account-show-signup').setAttribute('aria-pressed', String(name === 'signup'));
  accountGuest.hidden = false;
  accountProfile.hidden = true;
  setAccountStatus('');
}

function showAuthenticatedAccount(user) {
  accountUser = user;
  accountGuest.hidden = true;
  accountProfile.hidden = false;
  document.getElementById('account-profile-name').value = user.displayName;
  document.getElementById('account-profile-email').value = user.email;
  document.getElementById('account-greeting').textContent = accountMessage('greeting', user.displayName);
  accountNav.textContent = accountMessage('myAccount');
  translateAccount();
}

function showSignedOut(message = '') {
  accountUser = null;
  accountGuest.hidden = false;
  accountProfile.hidden = true;
  accountNav.textContent = accountMessage('account');
  showAccountForm('login');
  if (message) setAccountStatus(message);
}

async function sendAccountRequest(endpoint, data) {
  let response;
  try {
    response = await fetch(`/api/account/${endpoint}`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch {
    throw new Error(accountMessage('networkError'));
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error(accountMessage('serverUnavailable'));
  }
  if (!response.ok) {
    const errorKeys = {
      INVALID_SIGNUP: 'invalidSignup',
      EMAIL_IN_USE: 'emailInUse',
      INVALID_CREDENTIALS: 'invalidCredentials',
      INVALID_EMAIL: 'invalidEmail',
      INVALID_PASSWORD: 'invalidPassword',
      INVALID_RESET_TOKEN: 'invalidResetToken',
      INVALID_DISPLAY_NAME: 'invalidDisplayName',
      INVALID_CURRENT_PASSWORD: 'invalidCurrentPassword',
      RATE_LIMITED: 'rateLimited',
      ACCOUNT_ERROR: 'backendError',
      RESET_EMAIL_UNAVAILABLE: 'resetEmailUnavailable',
      RESET_EMAIL_FAILED: 'resetEmailFailed'
    };
    throw new Error(errorKeys[result.code]
      ? accountMessage(errorKeys[result.code])
      : result.error || accountMessage('unexpected'));
  }
  return result;
}

async function submitAccountForm(form, action) {
  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  setAccountStatus('');
  try {
    await action(new FormData(form));
  } catch (error) {
    setAccountStatus(error.message || accountMessage('unexpected'), true);
  } finally {
    submitButton.disabled = false;
  }
}

document.getElementById('account-show-login').addEventListener('click', () => showAccountForm('login'));
document.getElementById('account-show-signup').addEventListener('click', () => showAccountForm('signup'));
document.getElementById('account-show-reset-request').addEventListener('click', () => {
  document.getElementById('account-reset-email').value = document.getElementById('account-login-email').value;
  showAccountForm('requestReset');
});
document.getElementById('account-reset-back').addEventListener('click', () => showAccountForm('login'));
document.getElementById('account-reset-cancel').addEventListener('click', () => {
  resetToken = '';
  window.history.replaceState({}, '', window.location.pathname);
  showAccountForm('login');
});

accountForms.login.addEventListener('submit', (event) => {
  event.preventDefault();
  submitAccountForm(accountForms.login, async (formData) => {
    const result = await sendAccountRequest('login', {
      email: formData.get('email'),
      password: formData.get('password')
    });
    showAuthenticatedAccount(result.user);
    accountForms.login.reset();
    setAccountStatus(accountMessage('loginSuccess'));
  });
});

accountForms.signup.addEventListener('submit', (event) => {
  event.preventDefault();
  submitAccountForm(accountForms.signup, async (formData) => {
    const result = await sendAccountRequest('signup', {
      displayName: formData.get('displayName'),
      email: formData.get('email'),
      password: formData.get('password')
    });
    showAuthenticatedAccount(result.user);
    accountForms.signup.reset();
    setAccountStatus(accountMessage('signupSuccess'));
  });
});

accountForms.requestReset.addEventListener('submit', (event) => {
  event.preventDefault();
  submitAccountForm(accountForms.requestReset, async (formData) => {
    await sendAccountRequest('forgot-password', { email: formData.get('email') });
    setAccountStatus(accountMessage('resetRequested'));
    accountForms.requestReset.reset();
  });
});

accountForms.reset.addEventListener('submit', (event) => {
  event.preventDefault();
  submitAccountForm(accountForms.reset, async (formData) => {
    if (!resetToken) throw new Error(accountMessage('invalidReset'));
    await sendAccountRequest('reset-password', {
      token: resetToken,
      password: formData.get('password')
    });
    resetToken = '';
    window.history.replaceState({}, '', window.location.pathname);
    showSignedOut(accountMessage('resetSuccess'));
    accountForms.reset.reset();
  });
});

document.getElementById('account-profile-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  submitAccountForm(form, async (formData) => {
    const result = await sendAccountRequest('profile', { displayName: formData.get('displayName') });
    showAuthenticatedAccount(result.user);
    setAccountStatus(accountMessage('profileSuccess'));
  });
});

document.getElementById('account-password-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  submitAccountForm(form, async (formData) => {
    if (formData.get('currentPassword') === formData.get('newPassword')) {
      throw new Error(accountMessage('passwordMismatch'));
    }
    await sendAccountRequest('change-password', {
      currentPassword: formData.get('currentPassword'),
      newPassword: formData.get('newPassword')
    });
    form.reset();
    setAccountStatus(accountMessage('passwordSuccess'));
  });
});

document.getElementById('account-logout').addEventListener('click', async (event) => {
  const button = event.currentTarget;
  button.disabled = true;
  setAccountStatus('');
  try {
    await sendAccountRequest('logout', {});
    showSignedOut(accountMessage('logoutSuccess'));
  } catch (error) {
    setAccountStatus(error.message || accountMessage('unexpected'), true);
  } finally {
    button.disabled = false;
  }
});

document.addEventListener('bluewave:languagechange', translateAccount);

async function initializeAccount() {
  translateAccount();
  if (resetToken) {
    document.querySelector('[data-page="account"]').click();
    showAccountForm('reset');
    translateAccount();
    return;
  }

  showSignedOut();
  try {
    const response = await fetch('/api/account/me', { credentials: 'same-origin' });
    if (response.ok) {
      const result = await response.json();
      showAuthenticatedAccount(result.user);
    } else if (response.status !== 401) {
      setAccountStatus(accountServiceError(response.status), true);
    }
  } catch (error) {
    setAccountStatus(
      error instanceof TypeError ? accountServiceError(0) : accountMessage('serverUnavailable'),
      true
    );
  }
}

initializeAccount();
