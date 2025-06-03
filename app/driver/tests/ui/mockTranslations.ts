import { vi } from 'vitest'

export function mockNextIntl() {
  vi.mock('next-intl', () => ({
    NextIntlClientProvider: ({ children }: {children: React.ReactNode}) => children,
      createSharedPathnamesNavigation: () => ({
        useRouter: () => ({
          push: vi.fn(),
          replace: vi.fn(),
        }),
        usePathname: () => '/test',
      }),
    useFormatter: () => ({
      dateTime: (value: string | number | Date) => value instanceof Date ? value.toLocaleString() : new Date(value).toLocaleString(),
      number: (n: number) => `$${n.toFixed(2)}`
    }),
    useLocale: () => 'en',
    useTranslations: (namespace?: string) => {
      return (key: string) => {
        const translations: Record<string, string> = {
          // Common
          'english': '🌐English',
          'spanish': 'Español',
    
          // Landing Page
          'landingPage.card title': 'Park. Pay. Relax.',
          'landingPage.zone-prompt': 'Enter Zone Number',
          'landingPage.login prompt line 1': 'Save the hassle',
          'landingPage.login prompt line 2': 'of entering License plate each time',
          'landingPage.Get Started': 'Get Started',
          'landingPage.How to use': 'How to use',
          'landingPage.How to use step 1': 'Enter your zone number',
          'landingPage.How to use step 2': 'Select your vehicle type',
          'landingPage.How to use step 3': 'Enter your license plate',
          'landingPage.How to use step 4': 'Select your parking duration',
          'landingPage.How to use step 5': 'Pay and park',
          'landingPage.How to use step 6': 'Relax and enjoy',
    
          // Footer
          'footer.Do Not Sell My Personal Info': 'Do Not Sell My Personal Info',
          'footer.Privacy Policy': 'Privacy Policy',
          'footer.Terms of Service': 'Terms of Service',
          'footer.Contact Us': 'Contact Us',
          'footer.Dark Mode': 'Dark Mode',
          'footer.Rights Reserved': '© 2025 Copark. All rights reserved.',
    
          // Dashboard
          'dashboard.title': 'Available Permits',
          'dashboard.bestValue': 'Best Value',
          'dashboard.quickAccess': 'Quick Access',
          'dashboard.allLotsAccess': 'All Lots Access',
          'dashboard.selected': 'Selected',
          'dashboard.purchase': 'Purchase Permit',
          'dashboard.loading': 'Loading permits...',
          'dashboard.zone': 'Zone',
          'dashboard.activePermits': 'Active Permits',
          'dashboard.futurePermits': 'Future Permits',
          'dashboard.expiredPermits': 'Expired Permits',
          'dashboard.area': 'Area',
          'dashboard.active': 'Active',
          'dashboard.expires': 'Expires',
          'dashboard.default': 'Default Vehicle',
    
          // Bottom Navigation
          'bottomNav.home': 'Home',
          'bottomNav.tickets': 'Tickets',
          'bottomNav.garage': 'Garage',
          'bottomNav.logout': 'Logout',
    
          // Permits
          'permits.daily': 'Daily',
          'permits.quarterly': 'Quarterly',
          'permits.yearly': 'Yearly',
          'permits.lot': 'Lot ',
    
          // Zone
          'zone.title': 'Where are you parking?',
          'zone.label': 'Zone #',
          'zone.confirm': 'Confirm Zone',
          'zone.errorRequired': 'Zone number is required',
          'zone.errorInvalid': 'Zone does not exist',
          'zone.freeToday': 'This zone is not charging today. Check back tomorrow!',
          'zone.closedNow': 'This zone is currently closed. No payment is currently necessary. Please check our hours.',
          'zone.okay': 'Okay',
    
          // Stepper
          'stepper.zone': 'Zone',
          'stepper.vehicle': 'Vehicle',
          'stepper.payment': 'Payment',
          'stepper.confirmation': 'Confirmation',
    
          // Duration
          'duration.title': 'What parking rate works for you?',
          'duration.description': 'This parking operator currently offers multiple parking rate options.',
          'duration.option_hourly': 'By the hour and the minute',
          'duration.option_max': 'Maximum Parking Time',
          'duration.error_no_selection': 'Please select a parking rate',
          'duration.select_duration': 'Select your parking duration',
          'duration.hours': 'Hours',
          'duration.minutes': 'Minutes',
          'duration.estimated_price': 'Estimated Price:',
          'duration.fees_notice': 'Transaction fees and taxes may apply in later steps.',
          'duration.review_duration': 'Review your duration',
          'duration.duration_summary': 'This rate ({option}) allows you to park here for {duration} until {endTime}.',
          'duration.continue': 'Continue',
    
          // Login Page
          'loginPage.title': 'Log In',
          'loginPage.google': 'Sign In With Google',
          'loginPage.github': 'Sign In With GitHub',
          'loginPage.facebook': 'Sign In With Facebook',
          'loginPage.signup prompt': 'New to Copark?',
          'loginPage.signup link': 'Sign Up',
    
          // Signup Page
          'signupPage.title': 'Sign Up',
          'signupPage.google': 'Sign Up With Google',
          'signupPage.github': 'Sign Up With GitHub',
          'signupPage.facebook': 'Sign Up With Facebook',
          'signupPage.login prompt': 'Already have an account?',
          'signupPage.login link': 'Log In',
    
          // Onboarding - TOS
          'onboarding.tos.title': 'Terms of Service',
          'onboarding.tos.welcome': 'Welcome to Copark',
          'onboarding.tos.agreement': 'By accessing or using Copark\'s parking management   services, you agree to be bound by these Terms of Service.',
          'onboarding.tos.terms.line1.point': 'Service Description: ',
          'onboarding.tos.terms.line1.description': 'Copark provides parking lot management and  enforcement services through our platform.',
          'onboarding.tos.terms.line2.point': 'License: ',
          'onboarding.tos.terms.line2.description': 'We grant you a limited, non-exclusive,  non-transferable license to use our service for your parking   management needs.',
          'onboarding.tos.terms.line3.point': 'User Accounts: ',
          'onboarding.tos.terms.line3.description': 'You are responsible for maintaining the   confidentiality of your account credentials and for all activities  under your account.',
          'onboarding.tos.terms.line4.point': 'Privacy: ',
          'onboarding.tos.terms.line4.description': 'Your use of our services is also governed by our  Privacy Policy, which outlines how we collect and use your data.',
          'onboarding.tos.terms.line5.point': 'Data Usage: ',
          'onboarding.tos.terms.line5.description': 'We collect license plate data and parking   information solely for enforcement purposes. This data is stored  securely and used only as necessary for service operation.',
          'onboarding.tos.terms.line6.point': 'Limitations: ',
          'onboarding.tos.terms.line6.description': 'Our services are provided "as is" without   warranties of any kind, either express or implied.',
          'onboarding.tos.terms.line7.point': 'Changes: ',
          'onboarding.tos.terms.line7.description': 'We reserve the right to modify these terms at any   time. Continued use after changes constitutes acceptance of the new   terms.',
          'onboarding.tos.acceptTerms': 'I have read and agree to the Terms of Service',
          'onboarding.tos.continue': 'Continue',
    
          // Onboarding - Vehicle
          'onboarding.vehicle.page1.title1': 'Welcome to Your',
          'onboarding.vehicle.page1.title2': 'Digital Garage',
          'onboarding.vehicle.page1.subline': 'Start your journey by adding your first vehicle and get your permits with a tap.',
          'onboarding.vehicle.page1.f1.title': 'Single Click permits',
          'onboarding.vehicle.page1.f1.description': 'Purchase permits with a single click',
          'onboarding.vehicle.page1.f2.title': 'Check and Pay for Tickets',
          'onboarding.vehicle.page1.f2.description': 'Check for tickets on your vehicle and pay instantly',
          'onboarding.vehicle.page1.prompt': 'Add Your First Vehicle',
          'onboarding.vehicle.page1.secure': 'Your data is secure • Add unlimited vehicles later',
          'onboarding.vehicle.page2.prompt': 'Add Your First Vehicle',
          'onboarding.vehicle.page2.subline': 'Let\'s get started by adding your vehicle details.',
          'onboarding.vehicle.page2.form.title': 'Add Vehicle',
          'onboarding.vehicle.page2.form.license.label': 'License Plate Number',
          'onboarding.vehicle.page2.form.license.required': 'License plate number is required',
          'onboarding.vehicle.page2.form.license.constraint': 'Must be 1-10 characters',
          'onboarding.vehicle.page2.form.country': 'Country',
          'onboarding.vehicle.page2.form.state': 'State',
          'onboarding.vehicle.page2.form.nickname': 'Nickname',
          'onboarding.vehicle.page2.form.optional': 'optional',
          'onboarding.vehicle.page2.form.continue': 'Continue to Dashboard',
    
          // Ticket
          'ticket.ticket': 'Ticket',
          'ticket.title': 'Your Tickets',
          'ticket.noTickets': 'You have no tickets at this time.',
          'ticket.evidence.title': 'Evidence Photos',
          'ticket.evidence.photo': 'Photo',
          'ticket.payTicket': 'Pay Ticket',
          'ticket.challengeTicket': 'Challenge Ticket',
          'ticket.ticketDetails.title': 'Parking Violation',
          'ticket.ticketDetails.type': 'VIOLATION TYPE',
          'ticket.ticketDetails.date': 'ISSUE DATE',
          'ticket.challengeTicketPage.title': 'Challenge Ticket',
          'ticket.challengeTicketPage.reason': 'Reason',
          'ticket.challengeTicketPage.description': 'Please describe the reason for your challenge... (minimum 25 characters)',
          'ticket.challengeTicketPage.submit': 'Submit Challenge',
          'ticket.challengeTicketPage.back': 'Go Back To Ticket',
          'ticket.successChallenge.title': 'Ticket Challenged Successfully',
          'ticket.successChallenge.line1': 'We have successfully received your challenge request. Our team will review it and get back to you in 2 - 4 weeks.',
          'ticket.successChallenge.line2': 'Redirecting back automatically...',
          'ticket.successChallenge.back': 'Go Back To Ticket',
    
          // Garage
          'garage.add.add Vehicle': 'Add Vehicle',
          'garage.add.license.label': 'License Plate Number',
          'garage.add.license.required': 'License plate number is required',
          'garage.add.license.constraint': 'Must be 1-10 characters',
          'garage.add.country': 'Country',
          'garage.add.state': 'State',
          'garage.add.nickname': 'Nickname',
          'garage.add.optional': 'optional',
          'garage.add.save': 'Save',
          'garage.edit.delete': 'Delete',
          'garage.edit.warning.title': 'Warning',
          'garage.edit.warning.message': 'Deleting your vehicle will automatically expire all associated permits and will not be refundable.',
          'garage.edit.cancel': 'Cancel',
          'garage.edit.edit': 'Edit',
          'garage.edit.nickname': 'Nickname',
          'garage.edit.save': 'Save',
          'garage.checkout.title': 'Which Vehicle?',
          'garage.checkout.continue': 'Continue',
          'garage.title': 'Your Vehicles',
          'garage.add vehicle': 'Add Vehicle',
          'garage.subtitle': 'Vehicle Preference',
          'garage.default': 'default',
          'garage.noVehicles': 'No vehicles yet',
          'garage.prompt': 'Add your vehicle information to start parking',
          'garage.setDefault': 'Set as Default Vehicle',
          'garage.selectVehicleError': 'Please select a vehicle',
    
          // Payment Confirmation
          'paymentConfirmation.title': 'Payment Confirmed',
          'paymentConfirmation.transaction': 'Transaction Id:',
          'paymentConfirmation.description.line1': 'Your payment has been successfully processed. Thank you for your order!',
          'paymentConfirmation.description.line2': 'You will receive a confirmation email shortly.',
          'paymentConfirmation.continue': 'Continue to Dashboard',
    
          // My Permits
          'mypermits.myPermits': 'My Permits',
          'mypermits.activePermits': 'Active Permits',
          'mypermits.futurePermits': 'Future Permits',
          'mypermits.expiredPermits': 'Expired Permits',
          'mypermits.area': 'Area',
          'mypermits.active': 'Active',
          'mypermits.expires': 'Expires',
        };    

        if (namespace) {
          const namespacedKey = `${namespace}.${key}`;
          if (translations[namespacedKey]) {
            return translations[namespacedKey];
          }
        }

        return translations[key] || key;
      };
    },
  }));
}
