const JSON1 = {
  buro_call_help: {
    question: {
      audioErrorMessage: '',
      connections: [
        {
          answers: {},
          containsAny: [],
          context: {},
          goto: 'buro_no_interest',
          greaterThan: '',
          inArray: [],
          isDefault: false,
          isNotString: '',
          isString: 'No me interesa',
          lessThan: '',
          nlp: {},
          notInArray: [],
          setContext: {},
        },
        {
          answers: {},
          containsAny: [],
          context: {},
          goto: 'buro_have_it',
          greaterThan: '',
          inArray: [],
          isDefault: true,
          isNotString: '',
          isString: '',
          lessThan: '',
          nlp: {},
          notInArray: [],
          setContext: {},
        },
      ],
      errorMessageNotMatch:
        'Creo que no te he entendido 🙈... Más fácil dime SI o NO esta vez :)',
      exactMatch: true,
      immediateNext: false,
      index: 'buro_call_help',
      isAudio: false,
      quickReplies: ['Ya lo tengo', 'No me interesa'],
      text: 'Puedes marcar al 53-40-09-99 o al 54-49-49-54 y te asistirán!',
    },
  },
  buro_end: {
    question: {
      audioErrorMessage: '',
      connections: [],
      errorMessageNotMatch: '',
      exactMatch: false,
      immediateNext: true,
      index: 'buro_end',
      isAudio: false,
      quickReplies: [],
      text:
        'Listo! Notifiqué al equipo de Manpower para que revise tu Buró y te avisaré por aquí el siguiente paso. Gracias!',
    },
  },
  buro_generate: {
    question: {
      audioErrorMessage: '',
      cards: [
        {
          buttons: [
            {
              title: 'VER INSTRUCCIONES',
              type: 'web_url',
              url:
                'https://docs.google.com/presentation/d/16FWgoQecJWc4wSKXAqpLaDfx2_VWbiIJ/edit#slide=id.p1',
            },
            {
              payload: 'Ayuda',
              title: 'NECESITO AYUDA',
              type: 'postback',
            },
            {
              payload: 'Ya lo tengo',
              title: 'YA LO TENGO',
              type: 'postback',
            },
          ],
        },
      ],
      connections: [
        {
          answers: {},
          containsAny: [],
          context: {},
          goto: 'buro_call_help',
          greaterThan: '',
          inArray: [],
          isDefault: false,
          isNotString: '',
          isString: 'Ayuda',
          lessThan: '',
          nlp: {},
          notInArray: [],
          setContext: {},
        },
        {
          answers: {},
          containsAny: [],
          context: {},
          goto: 'buro_is_new',
          greaterThan: '',
          inArray: [],
          isDefault: true,
          isNotString: '',
          isString: '',
          lessThan: '',
          nlp: {},
          notInArray: [],
          setContext: {},
        },
      ],
      errorMessageNotMatch: '',
      exactMatch: false,
      immediateNext: false,
      index: 'buro_generate',
      isAudio: false,
      quickReplies: [],
      text:
        'No hay problema, entonces te comparto las instrucciones de cómo realizarlo aquí:  ',
    },
  },
  buro_generate_again: {
    question: {
      audioErrorMessage: '',
      cards: [
        {
          buttons: [
            {
              title: 'VER INSTRUCCIONES',
              type: 'web_url',
              url:
                'https://docs.google.com/presentation/d/16FWgoQecJWc4wSKXAqpLaDfx2_VWbiIJ/edit#slide=id.p1',
            },
            {
              payload: 'Ayuda',
              title: 'NECESITO AYUDA',
              type: 'postback',
            },
            {
              payload: 'Ya lo tengo',
              title: 'YA LO TENGO',
              type: 'postback',
            },
          ],
        },
      ],
      connections: [
        {
          answers: {},
          containsAny: [],
          context: {},
          goto: 'buro_call_help',
          greaterThan: '',
          inArray: [],
          isDefault: false,
          isNotString: '',
          isString: 'Ayuda',
          lessThan: '',
          nlp: {},
          notInArray: [],
          setContext: {},
        },
        {
          answers: {},
          containsAny: [],
          context: {},
          goto: 'buro_is_new',
          greaterThan: '',
          inArray: [],
          isDefault: true,
          isNotString: '',
          isString: '',
          lessThan: '',
          nlp: {},
          notInArray: [],
          setContext: {},
        },
      ],
      errorMessageNotMatch: '',
      exactMatch: false,
      immediateNext: false,
      index: 'buro_generate_again',
      isAudio: false,
      quickReplies: [],
      text:
        'Entonces tienes que generarlo nuevamente. Te recuerdo las instrucciones de cómo realizarlo aquí: ',
    },
  },
  buro_have_it: {
    question: {
      audioErrorMessage: '',
      cards: [
        {
          buttons: [
            {
              payload: 'Enviado',
              title: 'ENVIADO',
              type: 'postback',
            },
            {
              payload: 'No puedo generar',
              title: 'NO PUEDO GENERAR',
              type: 'postback',
            },
          ],
        },
      ],
      connections: [
        {
          answers: {},
          containsAny: [],
          context: {},
          goto: 'buro_generate',
          greaterThan: '',
          inArray: [],
          isDefault: false,
          isNotString: '',
          isString: 'No puedo generar',
          lessThan: '',
          nlp: {},
          notInArray: [],
          setContext: {},
        },
        {
          answers: {},
          containsAny: [],
          context: {},
          goto: 'buro_end',
          greaterThan: '',
          inArray: [],
          isDefault: true,
          isNotString: '',
          isString: '',
          lessThan: '',
          nlp: {},
          notInArray: [],
          setContext: {},
        },
      ],
      errorMessageNotMatch: '',
      exactMatch: false,
      immediateNext: false,
      index: 'buro_have_it',
      isAudio: false,
      quickReplies: [],
      text:
        'El siguiente paso es que lo envíes a mvaleriano@manpowergroup.com.mx \n\nSi no lo envías no podrás avanzar. Debes enviarlo (incluyendo el documento que se llama archivo protegido) escribiendo en el asunto que es de parte de Emi. Además debes incluir en el correo la contraseña del reporte si es que tiene una. Necesito que me confirmes con el botón de abajopor favor cuando lo hayas enviado así le notifico al equipo de Manpower para que lo revise.\n\nSolo presiona el botón ⬇️ cuando hayas enviado el mail',
    },
  },
  buro_intro: {
    question: {
      audioErrorMessage: '',
      connections: [
        {
          answers: {},
          containsAny: [],
          context: {},
          goto: 'buro_is_new',
          greaterThan: '',
          inArray: [],
          isDefault: false,
          isNotString: '',
          isString: 'Si',
          lessThan: '',
          nlp: {},
          notInArray: [],
          setContext: {},
        },
        {
          answers: {},
          containsAny: [],
          context: {},
          goto: 'buro_generate',
          greaterThan: '',
          inArray: [],
          isDefault: false,
          isNotString: '',
          isString: 'No',
          lessThan: '',
          nlp: {},
          notInArray: [],
          setContext: {},
        },
        {
          answers: {},
          containsAny: [],
          context: {},
          goto: 'buro_no_interest',
          greaterThan: '',
          inArray: [],
          isDefault: true,
          isNotString: '',
          isString: '',
          lessThan: '',
          nlp: {},
          notInArray: [],
          setContext: {},
        },
      ],
      errorMessageNotMatch:
        'Creo que no te he entendido 🙈... Más fácil dime SI o NO esta vez :)',
      exactMatch: true,
      immediateNext: false,
      index: 'buro_intro',
      isAudio: false,
      quickReplies: ['Si', 'No', 'No me interesa'],
      text:
        'Tengo buenas noticias 🙂. Has avanzado al siguiente paso del proceso. Al ser una institución bancaria quien te contrataría, necesito pedirte que generes tu reporte de estatus de Buró de Crédito y que se lo envíes por correo a un reclutador de Manpower. Conoces tu estatus en Buró de Crédito?',
    },
  },
  buro_is_new: {
    ai: {
      lang: 'ES',
      question_str: 'generic_yes_no_v2',
    },
    question: {
      audioErrorMessage: '',
      connections: [
        {
          answers: {},
          containsAny: [],
          context: {},
          goto: 'buro_generate_again',
          greaterThan: '',
          inArray: [],
          isDefault: false,
          isNotString: '',
          isString: 'No',
          lessThan: '',
          nlp: {},
          notInArray: [],
          setContext: {},
        },
        {
          answers: {},
          containsAny: [],
          context: {},
          goto: 'buro_have_it',
          greaterThan: '',
          inArray: [],
          isDefault: true,
          isNotString: '',
          isString: '',
          lessThan: '',
          nlp: {},
          notInArray: [],
          setContext: {},
        },
      ],
      errorMessageNotMatch:
        'Creo que no te he entendido 🙈... Más fácil dime SI o NO esta vez :)',
      exactMatch: true,
      immediateNext: false,
      index: 'buro_is_new',
      isAudio: false,
      quickReplies: ['Si', 'No'],
      text:
        'Perfecto, para checar, tienes una consulta de 3 meses a la fecha? Es decir, has generado el informe hace menos de 3 meses? (es necesario que sea hace menos de 3 meses)',
    },
  },
  buro_no_interest: {
    ai: {
      lang: 'ES',
      question_str: 'generic_yes_no_v2',
    },
    question: {
      audioErrorMessage: '',
      connections: [
        {
          answers: {},
          containsAny: [],
          context: {},
          goto: 'buro_not_interested_end',
          greaterThan: '',
          inArray: [],
          isDefault: false,
          isNotString: '',
          isString: 'Si',
          lessThan: '',
          nlp: {},
          notInArray: [],
          setContext: {},
        },
        {
          answers: {},
          containsAny: [],
          context: {},
          goto: 'buro_is_new',
          greaterThan: '',
          inArray: [],
          isDefault: true,
          isNotString: '',
          isString: '',
          lessThan: '',
          nlp: {},
          notInArray: [],
          setContext: {},
        },
      ],
      errorMessageNotMatch:
        'Creo que no te he entendido 🙈... Más fácil dime SI o NO esta vez :)',
      exactMatch: true,
      immediateNext: false,
      index: 'buro_no_interest',
      isAudio: false,
      quickReplies: ['Si', 'No'],
      text:
        'Es un requisito excluyente enviar el Buró. Me confirmas que entonces deseas abandonar tu postulación?',
    },
  },
  buro_not_interested_end: {
    question: {
      audioErrorMessage: '',
      connections: [],
      errorMessageNotMatch: '',
      exactMatch: false,
      immediateNext: true,
      index: 'buro_not_interested_end',
      isAudio: false,
      quickReplies: [],
      text:
        'No te preocupes, tal vez esta no era la posición ideal para ti, éxitos con la búsqueda laboral. Que tengas un lindo día :)',
    },
  },
  current: 'flow_hi',
  flow_hi: {
    question: {
      audioErrorMessage: '',
      connections: [
        {
          answers: {},
          containsAny: [],
          context: {},
          goto: 'buro_intro',
          greaterThan: '',
          inArray: [],
          isDefault: true,
          isNotString: '',
          isString: '',
          lessThan: '',
          nlp: {},
          notInArray: [],
          setContext: {},
        },
      ],
      errorMessageNotMatch: '',
      exactMatch: false,
      immediateNext: false,
      index: 'flow_hi',
      isAudio: false,
      quickReplies: [],
      text:
        'Hola Andy! Tengo novedades de Manpower acerca de tu postulación al puesto de Ejecutivo de Servicio (Cajero). ¿Tienes unos minutos?',
    },
  },
};

const s3Mock = {
  listObjects: (params, f) =>
    params.Prefix
      ? f('', {
          Contents: [
            { Key: 'module-test-xyz_v1.json' },
            { Key: 'module-test-xyz_v2.json' },
            { Key: 'module-test-b_v1.json' },
          ],
        })
      : f('', {
          Contents: [
            { Key: 'flow1.json' },
            { Key: 'flow2.py.json' },
            { Key: 'flow3.py' },
          ],
        }),
  listObjectVersions: () => ({
    promise: () =>
      new Promise(resolve =>
        resolve({
          Versions: [
            { VersionId: 1, LastModified: new Date() },
            { VersionId: 2, LastModified: new Date() },
          ],
        })
      ),
  }),
  getObject: () => ({
    promise: () =>
      new Promise(resolve =>
        resolve({ Body: { toString: () => JSON.stringify(JSON1, null, 2) } })
      ),
  }),
  upload: () => ({ promise: () => new Promise(resolve => resolve()) }),
  headObject: () => ({
    promise: () =>
      new Promise((resolve, reject) => reject({ code: 'NotFound' })),
  }),
  copyObject: () => ({ promise: () => new Promise(resolve => resolve()) }),
  deleteObject: () => ({ promise: () => new Promise(resolve => resolve()) }),
};

export default s3Mock;
