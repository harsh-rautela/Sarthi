// Adapter used by future crawlers/API importers. Keep ingestion separate from eligibility decisions.
export function normalizeScheme(raw, sourceUrl) {
  return {
    name: raw.name?.trim(),
    slug: raw.slug || raw.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    description: raw.description || 'No description provided.',
    ministry: raw.ministry || '',
    department: raw.department || '',
    category: raw.category || 'Social Security',
    level: raw.level || 'Central',
    applicableStates: raw.applicableStates || [],
    benefits: raw.benefits || [],
    documentsRequired: raw.documentsRequired || [],
    applicationProcess: raw.applicationProcess || [],
    eligibility: raw.eligibility || {},
    officialUrl: raw.officialUrl || sourceUrl,
    sourceUrl,
    sourceType: raw.sourceType || 'official-page',
    verified: false,
    active: true,
    lastVerifiedAt: null
  };
}
