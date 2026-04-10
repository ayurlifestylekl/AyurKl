import { defineField, defineType } from 'sanity'

export const treatment = defineType({
  name: 'treatment',
  title: 'Treatment',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'duration',
      title: 'Duration',
      type: 'string',
      description: 'Free-text duration label, e.g. "1 Hour 30 min" or "30 min".',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      description: 'Shown in the treatment card. Keep it to 1–3 short sentences.',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'treatmentCategory' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'requiresConsultation',
      title: 'Requires practitioner consultation',
      type: 'boolean',
      initialValue: false,
      description:
        'When enabled, the treatment card will show a "Practitioner Consultation Required" badge.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'duration',
      categoryTitle: 'category.title',
    },
    prepare: ({ title, subtitle, categoryTitle }) => ({
      title,
      subtitle: [categoryTitle, subtitle].filter(Boolean).join(' · '),
    }),
  },
})
