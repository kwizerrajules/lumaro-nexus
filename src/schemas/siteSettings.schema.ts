import { z } from 'zod';

export const siteSettingsSchema = z.object({
  primaryEmail: z.string().email().max(200),
  helpEmail: z.string().email().max(200),
  websiteUrl: z.string().url().max(500),
  websiteDisplay: z.string().min(1).max(200),
  phoneDisplay: z.string().min(1).max(50),
  /** Digits only for wa.me links, e.g. 250791756343 */
  whatsappNumber: z
    .string()
    .min(8)
    .max(20)
    .regex(/^\d+$/, 'WhatsApp number must be digits only (country code + number)'),
  address: z.string().min(1).max(300),
  availability: z.string().min(1).max(200),
  footerTagline: z.string().min(1).max(500),
});

export const updateSiteSettingsSchema = siteSettingsSchema.partial();

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
export type UpdateSiteSettingsInput = z.infer<typeof updateSiteSettingsSchema>;

/** Seed / fallback — matches current live footer & contact section. */
export const DEFAULT_SITE_SETTINGS: SiteSettingsInput = {
  primaryEmail: 'info@lumaronexus.com',
  helpEmail: 'help@lumaronexus.com',
  websiteUrl: 'https://www.lumaronexus.com',
  websiteDisplay: 'www.lumaronexus.com',
  phoneDisplay: '+250 791 756 343',
  whatsappNumber: '250791756343',
  address: 'Kigali, Rwanda',
  availability: 'Mon–Fri, 9:00 AM – 4:00 PM GMT+3',
  footerTagline:
    'Based in Kigali since 2014. We draw house plans and construction documents that fit local plots, budgets, and Rwanda housing standards.',
};
