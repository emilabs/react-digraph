import { getSimpleItem } from './components/common';

const defaultQuestionStr = 'yes_no';
const empathyDefaults = {
  best_match: {
    use_common_intents: false,
    lang: 'ES',
    prediction_data: {
      min_similarity: 85,
      options: {}, // keys will be added for the answer options
    },
  },
  best_match_no_retry: {
    use_common_intents: false,
    lang: 'ES',
    prediction_data: {
      min_similarity: 85,
      options: {}, // keys will be added for the answer options
    },
  },
  best_match_one: {
    use_common_intents: false,
    lang: 'ES',
    prediction_data: {
      min_similarity: 85,
      options: {}, // keys will be added for the answer options
    },
  },
  birthdate: {
    use_common_intents: false,
    lang: 'ES_AR',
    country: 'AR',
    prediction_data: {
      intent_responses: {},
    },
  },
  common_intents: {
    lang: 'ES_MX',
    country: 'MX',
    prediction_data: {
      intent_responses: {
        skip: 'No contestar',
        did_not_work: 'No trabaje',
        dont_know: 'No se',
        affirm: 'Si',
        deny: 'No',
        dont_have: 'No tengo',
        never_started: 'Nunca empece',
      },
    },
  },
  company_industry: {
    use_common_intents: false,
    lang: 'ES_MX',
    prediction_data: {
      intent_responses: {},
    },
  },
  company_name: {
    use_common_intents: false,
    lang: 'ES_MX',
    prediction_data: {
      intent_responses: {},
    },
  },
  cuil: {
    use_common_intents: false,
    lang: 'ES_AR',
    prediction_data: {
      intent_responses: {},
    },
  },
  curp: {
    use_common_intents: false,
    lang: 'ES_MX',
    country: 'MX',
    prediction_data: {
      intent_responses: {},
    },
  },
  dates: {
    use_common_intents: false,
    lang: 'ES',
    country: 'AR',
    prediction_data: {
      intent_responses: {},
    },
  },
  datetime: {
    use_common_intents: false,
    lang: 'ES',
    country: 'AR',
    prediction_data: {
      intent_responses: {},
    },
  },
  document: {
    use_common_intents: false,
    lang: 'ES',
    country: 'AR',
    prediction_data: {
      intent_responses: {},
    },
  },
  duration: {
    use_common_intents: false,
    lang: 'ES',
    country: 'AR',
    prediction_data: {
      intent_responses: {},
    },
  },
  education_degree_field: {
    use_common_intents: false,
    lang: 'ES_MX',
    prediction_data: {
      intent_responses: {},
    },
  },
  education_attendance_level: {
    use_common_intents: false,
    lang: 'ES_MX',
    prediction_data: {
      intent_responses: {
        'education-attendance-abandoned': 'Abandonada',
        'education-attendance-finished': 'Completa',
        'education-attendance-in_progress': 'En Curso',
        'education-attendance-never_started': 'No la inicié',
      },
    },
  },
  education_degree_level: {
    use_common_intents: false,
    lang: 'ES_MX',
    prediction_data: {
      intent_responses: {
        'education-degree_level-bachelor': 'universitario',
        'education-degree_level-master': 'master',
        'education-degree_level-doctoral': 'doctorado',
        'education-degree_level-primary': 'primario',
        'education-degree_level-tertiary': 'terciario',
        'education-degree_level-upper_secondary': 'secundario superior',
        'education-degree_level-lower_secondary': 'secundario inferior',
      },
    },
  },
  education_degree_title: {
    use_common_intents: false,
    lang: 'ES_MX',
    prediction_data: {
      intent_responses: {},
    },
  },
  email: {
    use_common_intents: false,
    lang: 'ES',
    country: 'AR',
    prediction_data: {
      intent_responses: {},
    },
  },
  phone: {
    use_common_intents: false,
    lang: 'ES',
    country: 'AR',
    prediction_data: {
      intent_responses: {},
    },
  },
  first_name: {
    use_common_intents: false,
    lang: 'ES_MX',
    country: 'MX',
    prediction_data: {
      intent_responses: {},
    },
  },
  gender: {
    use_common_intents: false,
    lang: 'ES_MX',
    prediction_data: {
      intent_responses: {},
    },
  },
  generic_yes_no_v2: {
    use_common_intents: false,
    lang: 'ES',
    prediction_data: {
      intent_responses: {
        generic_yes_no_y: 'Si',
        generic_yes_no_n: 'No',
        generic_yes_no_maybe: 'No se',
      },
    },
  },
  geocoder: {
    use_common_intents: false,
    lang: 'ES',
    country: 'AR',
    prediction_data: {
      intent_responses: {},
    },
  },
  job_channel: {
    use_common_intents: false,
    lang: 'ES_MX',
    prediction_data: {
      intent_responses: {},
    },
  },
  job_department: {
    use_common_intents: false,
    lang: 'ES_MX',
    prediction_data: {
      intent_responses: {},
    },
  },
  job_title: {
    use_common_intents: false,
    lang: 'ES_MX',
    country: 'MX',
    prediction_data: {
      intent_responses: {},
    },
  },
  interest_v2: {
    use_common_intents: false,
    lang: 'ES',
    prediction_data: {
      intent_responses: {
        'interest-yes': 'Está OK',
        'interest-no': 'No me interesa',
        'interest-another-time': 'Otro día/fecha',
        'interest-ask-address': 'Está OK',
      },
    },
  },
  last_name: {
    use_common_intents: false,
    lang: 'ES_MX',
    country: 'MX',
    prediction_data: {
      intent_responses: {},
    },
  },
  means_of_transport: {
    use_common_intents: false,
    lang: 'ES_MX',
    prediction_data: {
      intent_responses: {},
    },
  },
  nationality: {
    use_common_intents: false,
    lang: 'ES_MX',
    prediction_data: {
      intent_responses: {},
    },
  },
  nickname: {
    use_common_intents: false,
    lang: 'ES',
    country: 'AR',
    prediction_data: {
      intent_responses: {},
    },
  },
  number: {
    use_common_intents: false,
    lang: 'ES',
    prediction_data: {
      intent_responses: {},
    },
  },
  number_of_jobs: {
    use_common_intents: false,
    lang: 'ES',
    prediction_data: {
      intent_responses: {},
    },
  },
  ordinal: {
    use_common_intents: false,
    lang: 'ES',
    prediction_data: {
      intent_responses: {},
    },
  },
  prepa: {
    use_common_intents: false,
    lang: 'ES',
    prediction_data: {
      intent_responses: {
        'prepa-completa': 'Completa',
        'prepa-en-curso': 'En Curso',
        'prepa-sin-inicio': 'No la inicié',
        'prepa-trunca': 'Trunca',
      },
    },
  },
  progress: {
    use_common_intents: false,
    lang: 'ES',
    prediction_data: {
      intent_responses: {
        finished: 'Completa',
        in_progress: 'En Curso',
        never_started: 'No la inicié',
        abandoned: 'Trunca',
      },
    },
  },
  referral_source: {
    use_common_intents: false,
    lang: 'ES_MX',
    prediction_data: {
      intent_responses: {},
    },
  },
  salary: {
    use_common_intents: false,
    lang: 'ES',
    country: 'AR',
    prediction_data: {
      intent_responses: {},
      min_value: null,
      max_value: null,
    },
  },
  secondary_v2: {
    use_common_intents: false,
    lang: 'ES',
    prediction_data: {
      intent_responses: {
        secondary_abandoned: 'No lo terminé',
        secondary_finished: 'Terminado',
        secondary_in_progress: 'Lo estoy cursando',
      },
    },
  },
  schedule_v2: {
    use_common_intents: false,
    lang: 'ES',
  },
  sentiment: {
    use_common_intents: false,
    lang: 'ES',
    country: 'AR',
    prediction_data: {
      intent_responses: {},
    },
  },
  tasks: {
    use_common_intents: false,
    lang: 'ES_MX',
    prediction_data: {
      intent_responses: {},
    },
  },
  welcome_idle: 'welcome_idle',
  yes_no: {
    use_common_intents: false,
    lang: 'ES',
    prediction_data: {
      intent_responses: {
        acknowledge: 'Si',
        deny: 'No',
        dont_know: 'No se',
      },
    },
  },
};

const intentsByQuestionStr = {
  birthdate: [],
  common_intents: [
    'skip',
    'did_not_work',
    'dont_know',
    'affirm',
    'deny',
    'dont_have',
    'never_started',
  ],
  company_industry: [],
  company_name: [],
  cuil: [],
  curp: [],
  dates: [],
  duration: ['didNotWork'],
  education_degree_field: [],
  education_attendance_level: [],
  education_degree_level: [
    'education-degree_level-bachelor',
    'education-degree_level-master',
    'education-degree_level-doctoral',
    'education-degree_level-primary',
    'education-degree_level-tertiary',
    'education-degree_level-upper_secondary',
    'education-degree_level-lower_secondary',
  ],
  education_degree_title: [],
  email: [],
  first_name: [],
  gender: [],
  generic_yes_no_v2: [
    'generic_yes_no_n',
    'generic_yes_no_maybe',
    'generic_yes_no_y',
  ],
  geocoder: [],
  job_channel: [],
  job_department: [],
  job_title: [],
  interest_v2: [
    'interest-another-time',
    'interest-ask-address',
    'interest-yes',
    'interest-no',
  ],
  last_name: [],
  means_of_transport: [],
  nationality: [],
  nickname: [],
  number: [],
  number_of_jobs: [],
  phone: [],
  prepa: [
    'prepa-trunca',
    'prepa-en-curso',
    'prepa-sin-inicio',
    'prepa-completa',
  ],
  progress: ['finished', 'in_progress', 'never_started', 'abandoned'],
  referral_source: [],
  salary: [],
  schedule_v2: [
    'userNotInterested',
    'interestCant',
    'otherTime',
    'personalReason',
    'specificTimeAndDay',
    'studying',
    'userConfirms',
    'userDeniesPrediction',
    'confirmsUserInterest',
    'didNotSee',
    'fromDate',
  ],
  secondary_v2: [
    'secondary_abandoned',
    'secondary_in_progress',
    'secondary_finished',
  ],
  sentiment: ['sentiment_happy', 'sentiment_unhappy', 'sentiment_neutral'],
  tasks: [],
  yes_no: ['acknowledge', 'deny', 'dont_know'],
};

const entitiesByQuestionStr = {
  birthdate: ['date'],
  common_intents: [],
  company_industry: ['company_industry'],
  company_name: ['company_name'],
  cuil: ['cuil'],
  curp: ['curp'],
  dates: ['date'],
  duration: ['duration'],
  education_degree_field: ['education_degree_field'],
  education_attendance_level: [],
  education_degree_level: [],
  education_degree_title: ['education_degree_title'],
  email: ['email'],
  first_name: ['name'],
  gender: ['gender'],
  generic_yes_no_v2: [],
  // TODO: Geocoder entities are actually slots. Remove when refactor empathy returns slots
  geocoder: [
    'address_province',
    'address_postal_code',
    'address_country',
    'address_latitude',
    'address_longitude',
  ],
  job_channel: ['job_channel'],
  job_department: ['job_department'],
  job_title: ['job_title'],
  interest_v2: [],
  last_name: ['name'],
  means_of_transport: ['means_of_transport'],
  nationality: ['nationality'],
  nickname: ['name'],
  number: ['number'],
  number_of_jobs: ['number'],
  phone: ['phone'],
  prepa: [],
  referral_source: ['referral_source'],
  salary: ['salary'],
  schedule_v2: [],
  secondary_v2: [],
  sentiment: [],
  tasks: ['Tasks'],
};

const faqDefaults = {
  lang: 'ES',
  min_similarity: 90,
  options: {},
  question_str: 'best_match',
};

const deprecatedQuestionStrs = [
  'best_match',
  'generic_yes_no_v2',
  'secondary_v2',
  'prepa',
  'interest_v2',
  'education_attendance_level',
];
const langLabels = ['ES', 'ES_AR', 'ES_MX', 'EN_US'];
const countryLabels = ['MX', 'AR', 'US'];
const questionStrItems = Object.keys(empathyDefaults).map(q => {
  const item = getSimpleItem(q);

  if (deprecatedQuestionStrs.includes(q)) {
    item.label += '(deprecated)';
  }

  return item;
});
const langItems = langLabels.map(l => getSimpleItem(l));
const countryItems = countryLabels.map(c => getSimpleItem(c));
const commonIntents = intentsByQuestionStr.common_intents;
const getSupportedIntents = ai => [
  ...(intentsByQuestionStr[ai.question_str] || []),
  ...(ai.use_common_intents ? commonIntents : []),
];

const getDefaultCommonIntentsDict = () =>
  JSON.parse(
    JSON.stringify(
      empathyDefaults.common_intents.prediction_data.intent_responses
    )
  );

export {
  commonIntents,
  countryItems,
  defaultQuestionStr,
  deprecatedQuestionStrs,
  empathyDefaults,
  entitiesByQuestionStr,
  faqDefaults,
  getDefaultCommonIntentsDict,
  getSupportedIntents,
  intentsByQuestionStr,
  langItems,
  questionStrItems,
};
