import { vi } from 'vitest'

export function mockNextIntl() {
  vi.mock('next-intl', () => ({
    useFormatter: () => ({
      dateTime: (value: string | number | Date) => value instanceof Date ? value.toLocaleString() : new Date(value).toLocaleString(),
      number: (n: number) => `$${n.toFixed(2)}`
    }),
    useLocale: () => 'en',
    useTranslations: (namespace?: string) => {
      return (key: string) => {
        const translations: Record<string, string> = {
          'english': '🌐English',
          'spanish': 'Español',
          'card title': 'Park. Pay. Relax.',
          'zone-prompt': 'Enter Zone Number',
          'login prompt line 1': 'Save the hassle',
          'login prompt line 2': 'of entering License plate each time',
          'Get Started': 'Get Started',
          'How to use': 'How to use',
          'How to use step 1': 'Enter your zone number',
          'How to use step 2': 'Select your vehicle type',
          'How to use step 3': 'Enter your license plate',
          'How to use step 4': 'Select your parking duration',
          'How to use step 5': 'Pay and park',
          'How to use step 6': 'Relax and enjoy',
          'Do Not Sell My Personal Info': 'Do Not Sell My Personal Info',
          'Privacy Policy': 'Privacy Policy',
          'Terms of Service': 'Terms of Service',
          'Contact Us': 'Contact Us',
          'Dark Mode': 'Dark Mode',
          'Rights Reserved': '© 2025 Copark. All rights reserved.',
          'dashboard.title': 'Available Permits',
          'dashboard.bestValue': 'Best Value',
          'dashboard.quickAccess': 'Quick Access',
          'dashboard.allLotsAccess': 'All Lots Access',
          'dashboard.selected': 'Selected',
          'dashboard.purchase': 'Purchase Permit',
          'dashboard.loading': 'Loading permits...',
          'dashboard.zone': 'Zone',
          'bottomNav.home': 'Home',
          'bottomNav.tickets': 'Tickets',
          'bottomNav.garage': 'Garage',
          'bottomNav.logout': 'Logout',
          'permits.daily': 'Daily',
          'permits.quarterly': 'Quarterly',
          'permits.yearly': 'Yearly',
          'permits.lot': 'Lot ',
          'zone.title': 'Where are you parking?',
          'zone.label': 'Zone #',
          'zone.confirm': 'Confirm Zone',
          'zone.errorRequired': 'Zone number is required',
          'zone.errorInvalid': 'Zone does not exist',
          'zone.freeToday': 'This zone is not charging today. Check back tomorrow!',
          'zone.closedNow': 'This zone is currently closed. No payment is currently necessary. Please check our hours.',
          'zone.okay': 'Okay',
          'stepper.zone': 'Zone',
          'stepper.vehicle': 'Vehicle',
          'stepper.payment': 'Payment',
          'stepper.confirmation': 'Confirmation',
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
