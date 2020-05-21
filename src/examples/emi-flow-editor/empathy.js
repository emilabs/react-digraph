import { getSimpleItem } from './components/common';

const defaultQuestionStr = 'generic_yes_no_v2';
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
  birthdate: {
    use_common_intents: false,
    lang: 'ES_AR',
    country: 'AR',
    prediction_data: {
      intent_responses: {
        skip: 'No responder',
      },
    },
  },
  common_intents: {
    lang: 'ES_AR',
    country: 'AR',
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
  curp: {
    use_common_intents: false,
    lang: 'ES_MX',
    country: 'MX',
    prediction_data: {
      intent_responses: {
        skip: 'No tengo CURP',
      },
    },
  },
  dates: {
    use_common_intents: false,
    lang: 'ES',
    country: 'AR',
    prediction_data: {
      intent_responses: {
        skip: 'No responder',
      },
    },
  },
  datetime: {
    use_common_intents: false,
    lang: 'ES',
    country: 'AR',
  },
  document: {
    use_common_intents: false,
    lang: 'ES',
    country: 'AR',
  },
  duration: {
    use_common_intents: false,
    lang: 'ES',
    country: 'AR',
  },
  education_attendance_level: {
    use_common_intents: false,
    lang: 'ES',
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
    lang: 'ES',
    prediction_data: {
      intent_responses: {
        'education-degree_level-bachelor': 'universitario',
        'education-degree_level-master': 'master',
        'education-degree_level-primary': 'primario',
        'education-degree_level-tertiary': 'terciario',
        'education-degree_level-upper_secondary': 'secundario superior',
        'education-degree_level-lower_secondary': 'secundario inferior',
      },
    },
  },
  email: {
    use_common_intents: false,
    lang: 'ES',
    country: 'AR',
    prediction_data: {
      intent_responses: {
        dontHave: 'No tengo',
      },
    },
  },
  phone: {
    use_common_intents: false,
    lang: 'ES',
    country: 'AR',
    prediction_data: {
      intent_responses: {
        dontHave: 'No tengo',
      },
    },
  },
  first_name: {
    use_common_intents: false,
    lang: 'ES_MX',
    country: 'MX',
    prediction_data: {
      intent_responses: {
        dontHave: 'No tengo',
      },
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
      intent_responses: {
        dontHave: 'No tengo',
      },
    },
  },
  nickname: {
    use_common_intents: false,
    lang: 'ES',
    country: 'AR',
  },
  number: {
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
  time_interval: {
    use_common_intents: false,
    lang: 'ES',
    country: 'AR',
  },
  welcome_idle: 'welcome_idle',
};

const intentsByQuestionStr = {
  birthdate: ['skip'],
  curp: ['skip'],
  dates: ['skip'],
  duration: ['didNotWork'],
  email: ['dontHave'],
  first_name: ['dontHave'],
  generic_yes_no_v2: [
    'generic_yes_no_n',
    'generic_yes_no_maybe',
    'generic_yes_no_y',
  ],
  geocoder: [],
  interest_v2: [
    'interest-another-time',
    'interest-ask-address',
    'interest-yes',
    'interest-no',
  ],
  last_name: ['dontHave'],
  nickname: [],
  number: ['skip'],
  phone: ['dontHave'],
  prepa: [
    'prepa-trunca',
    'prepa-en-curso',
    'prepa-sin-inicio',
    'prepa-completa',
  ],
  salary: ['notSure'],
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
  common_intents: [
    'skip',
    'did_not_work',
    'dont_know',
    'affirm',
    'deny',
    'dont_have',
    'never_started',
  ],
};

const faqDefaults = {
  lang: 'ES',
  min_similarity: 90,
  options: {},
  question_str: 'best_match',
};

const deprecatedQuestionStrs = ['best_match'];
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
  faqDefaults,
  getDefaultCommonIntentsDict,
  getSupportedIntents,
  intentsByQuestionStr,
  langItems,
  questionStrItems,
};
