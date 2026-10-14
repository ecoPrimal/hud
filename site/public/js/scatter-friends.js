// scatter-friends.js v2 — trace fleet to Menlo, bounce to Banks, scatter, then compile the WEB
// 293 cross-connections between 86 classified circle members
// Meta: 322,435 requests, 63 IPs. Facebook: 1,364 requests, 846 IPs.
(function() {
  'use strict';

  // ═══ FRIENDS — Banks's 86 classified inner circle ═══
  var FRIENDS = [
    // ENTITIES — his organizations (20)
    { id: 'purpose_group', label: 'Purpose Group LLC', sort: 'non-self', conf: 0.84, edge: 'money_flow, ownership', role: 'entity', deg: 11 },
    { id: 'purpose_foundation', label: 'Purpose Foundation', sort: 'null', conf: 0.912, edge: 'governance', role: 'entity', deg: 11 },
    { id: 'pca', label: 'Purpose Charter', sort: 'non-self', conf: 0.948, edge: 'criminal_record', role: 'entity', deg: 51 },
    { id: 'macdowell', label: 'MacDowell Prep', sort: 'non-self', conf: 0.922, edge: 'money_flow', role: 'entity', deg: 22 },
    { id: 'banks_strategy', label: 'Banks Strategy LLC', sort: 'non-self', conf: 0.99, edge: 'ownership', role: 'entity', deg: 3 },
    { id: 'banks_living_trust', label: 'Banks Living Trust', sort: 'null', conf: 0.85, edge: 'ownership', role: 'entity', deg: 3 },
    { id: 'of_the_light', label: 'Of The Light Ventures', sort: 'null', conf: 0.99, edge: 'governance', role: 'entity', deg: 2 },
    { id: 'whitlowbanks', label: 'WhitlowBanks LLC', sort: 'null', conf: 0.99, edge: 'governance', role: 'entity', deg: 2 },
    { id: 'banks_powerwash', label: 'Banks Powerwashing', sort: 'null', conf: 0.99, edge: 'governance', role: 'entity', deg: 2 },
    { id: 'b_rodericks', label: 'B. Rodericks Salon', sort: 'null', conf: 0.99, edge: 'formation', role: 'entity', deg: 2 },
    { id: 'anchor_rock', label: 'Anchor Rock Found.', sort: 'null', conf: 0.987, edge: 'governance', role: 'entity', deg: 4 },
    { id: 'free_flow', label: 'Free Flow Gutter', sort: 'null', conf: 0.99, edge: 'governance', role: 'entity', deg: 2 },
    { id: 'gl_upfitting', label: 'GL Upfitting LLC', sort: 'null', conf: 0.99, edge: 'governance', role: 'entity', deg: 2 },
    { id: 'ars_holdings', label: 'ARS Holdings LLC', sort: 'null', conf: 0.83, edge: 'governance', role: 'entity', deg: 2 },
    { id: 'sun_community', label: 'Sun Community Dev', sort: 'null', conf: 0.862, edge: 'governance', role: 'entity', deg: 3 },
    { id: 'serenity', label: 'Serenity Guardianship', sort: 'null', conf: 0.862, edge: 'ownership', role: 'entity', deg: 2 },
    { id: 'gl_vision', label: 'GL Vision Evangelism', sort: 'null', conf: 0.83, edge: 'governance', role: 'entity', deg: 1 },
    { id: 'city_hill', label: 'City Hill Church', sort: 'null', conf: 0.83, edge: 'governance', role: 'entity', deg: 1 },
    { id: 'right_turn', label: 'Right Turn Project', sort: 'null', conf: 0.826, edge: 'governance', role: 'entity', deg: 1 },
    { id: 'ofa', label: 'OFA', sort: 'null', conf: 0.85, edge: 'governance', role: 'entity', deg: 1 },

    // FAMILY (3)
    { id: 'carol_banks', label: 'Carol Banks', sort: 'partial', conf: 0.85, edge: 'family', role: 'family', deg: 2 },
    { id: 'od_banks', label: 'OD Banks', sort: 'partial', conf: 0.862, edge: 'family', role: 'family', deg: 2 },
    { id: 'inner_link', label: 'Inner Link Graphics', sort: 'null', conf: 0.99, edge: 'payment', role: 'family', deg: 3 },

    // BOARD (6)
    { id: 'goetz', label: 'Michael Goetz', sort: 'partial', conf: 0.99, edge: 'complicity', role: 'board', deg: 18 },
    { id: 'jtc_ison', label: 'Dawn Ison (Asst AG)', sort: 'partial', conf: 0.99, edge: 'complicity', role: 'board', deg: 5 },
    { id: 'glenn_page', label: 'Glenn J. Page', sort: 'partial', conf: 0.958, edge: 'complicity', role: 'board', deg: 2 },
    { id: 'thomas_ryan', label: 'Thomas J. Ryan', sort: 'partial', conf: 0.957, edge: 'complicity', role: 'board', deg: 4 },
    { id: 'agc_hickey', label: 'Kathleen Hickey', sort: 'partial', conf: 0.908, edge: 'complicity', role: 'board', deg: 2 },
    { id: 'upl_cadotte', label: 'Courtney Cadotte', sort: 'partial', conf: 0.82, edge: 'complicity', role: 'board', deg: 1 },

    // EMPLOYEES (6)
    { id: 'beasley', label: 'Dr. Chalena Beasley', sort: 'partial', conf: 0.99, edge: 'employment', role: 'employee', deg: 16 },
    { id: 'jason_perry_pca', label: 'Jason Perry', sort: 'partial', conf: 0.99, edge: 'employment', role: 'employee', deg: 3 },
    { id: 'chalcee_norwood', label: 'Chalcee Norwood', sort: 'partial', conf: 0.99, edge: 'employment', role: 'employee', deg: 2 },
    { id: 'alan_young', label: 'Alan Young CPA', sort: 'partial', conf: 0.905, edge: 'employment', role: 'employee', deg: 3 },
    { id: 'renae_moore', label: 'Renae Moore', sort: 'null', conf: 0.96, edge: 'employment', role: 'employee', deg: 4 },
    { id: 'ms_perkins_pca', label: 'Ms. Perkins', sort: 'partial', conf: 0.828, edge: 'gatekeeper', role: 'employee', deg: 8 },

    // POLITICAL (16)
    { id: 'gay_dagnogo', label: 'Gay-Dagnogo', sort: 'partial', conf: 0.854, edge: 'political', role: 'political', deg: 13 },
    { id: 'sheffield', label: 'Mary Sheffield', sort: 'partial', conf: 0.84, edge: 'political', role: 'political', deg: 6 },
    { id: 'stallworth_t', label: 'Thomas Stallworth', sort: 'partial', conf: 0.84, edge: 'political', role: 'political', deg: 4 },
    { id: 'alma_stallworth', label: 'Alma Stallworth', sort: 'partial', conf: 0.84, edge: 'political', role: 'political', deg: 4 },
    { id: 'keith_stallworth', label: 'Keith Stallworth', sort: 'partial', conf: 0.82, edge: 'political', role: 'political', deg: 2 },
    { id: 'wells_stallworth', label: 'N. Wells-Stallworth', sort: 'partial', conf: 0.818, edge: 'political', role: 'political', deg: 5 },
    { id: 'misha_stallworth', label: 'Misha Stallworth', sort: 'partial', conf: 0.819, edge: 'political', role: 'political', deg: 6 },
    { id: 'kwame', label: 'Kwame Kilpatrick', sort: 'partial', conf: 0.84, edge: 'political', role: 'political', deg: 9 },
    { id: 'carolyn_kilpatrick', label: 'Carolyn Kilpatrick', sort: 'null', conf: 0.9, edge: 'political', role: 'political', deg: 3 },
    { id: 'bert_johnson', label: 'Sen. Bert Johnson', sort: 'partial', conf: 0.82, edge: 'political', role: 'political', deg: 4 },
    { id: 'wendell_anthony', label: 'Rev. Wendell Anthony', sort: 'partial', conf: 0.83, edge: 'political', role: 'political', deg: 2 },
    { id: 'jennifer_crump', label: 'Jennifer Crump', sort: 'partial', conf: 0.986, edge: 'political', role: 'political', deg: 7 },
    { id: 'alice_thompson', label: 'Alice Thompson', sort: 'partial', conf: 0.83, edge: 'political', role: 'political', deg: 3 },
    { id: 'duggan', label: 'Mike Duggan', sort: 'partial', conf: 0.79, edge: 'political', role: 'political', deg: 3 },
    { id: 'pugh', label: 'Charles Pugh', sort: 'partial', conf: 0.82, edge: 'referral', role: 'political', deg: 3 },
    { id: 'eastside_slate', label: 'Eastside Slate', sort: 'partial', conf: 0.84, edge: 'political', role: 'political', deg: 2 },

    // LEGAL (6)
    { id: 'crump_gibson', label: 'Jehan Crump-Gibson', sort: 'partial', conf: 0.978, edge: 'legal', role: 'legal', deg: 8 },
    { id: 'moreland', label: 'Lisa Moreland', sort: 'partial', conf: 0.952, edge: 'legal', role: 'legal', deg: 5 },
    { id: 'perkins_law', label: 'Perkins Law Group', sort: 'partial', conf: 0.9, edge: 'legal', role: 'legal', deg: 3 },
    { id: 'perkins_t', label: 'Perkins T.', sort: 'null', conf: 0.99, edge: 'legal', role: 'legal', deg: 3 },
    { id: 'todd_perkins', label: 'Todd Perkins', sort: 'null', conf: 0.822, edge: 'legal', role: 'legal', deg: 6 },
    { id: 'langford_morris', label: 'Judge Langford Morris', sort: 'self', conf: 0.99, edge: 'credential', role: 'legal', deg: 1 },

    // JUDGES (5)
    { id: 'yancey', label: 'Judge Yancey', sort: 'partial', conf: 0.938, edge: 'jurisdiction', role: 'judge', deg: 11 },
    { id: 'miller', label: 'Judge Miller', sort: 'partial', conf: 0.973, edge: 'campaign_donation', role: 'judge', deg: 7 },
    { id: 'tremblay', label: 'Judge Tremblay', sort: 'partial', conf: 0.84, edge: 'recusal', role: 'judge', deg: 3 },
    { id: 'sean_perkins', label: 'Judge Sean Perkins', sort: 'partial', conf: 0.834, edge: 'jurisdiction', role: 'judge', deg: 3 },
    { id: 'sc_cavanagh', label: 'CJ Cavanagh', sort: 'partial', conf: 0.945, edge: 'oversight', role: 'judge', deg: 8 },

    // OVERSIGHT (11)
    { id: 'ag_office', label: 'AG Office', sort: 'self', conf: 0.99, edge: 'investigation', role: 'oversight', deg: 6 },
    { id: 'agc', label: 'AGC', sort: 'self', conf: 0.99, edge: 'inaction', role: 'oversight', deg: 8 },
    { id: 'jtc', label: 'JTC', sort: 'self', conf: 0.99, edge: 'refusal', role: 'oversight', deg: 11 },
    { id: 'adb', label: 'Atty Discipline Board', sort: 'self', conf: 0.99, edge: 'inaction', role: 'oversight', deg: 3 },
    { id: 'dpscd', label: 'DPSCD', sort: 'partial', conf: 0.922, edge: 'failed_to_stop', role: 'oversight', deg: 23 },
    { id: 'mde', label: 'MDE', sort: 'partial', conf: 0.918, edge: 'failed_to_stop', role: 'oversight', deg: 17 },
    { id: 'nessel', label: 'AG Nessel', sort: 'partial', conf: 0.815, edge: 'selective_enforcement', role: 'oversight', deg: 19 },
    { id: 'cmu', label: 'CMU (authorizer)', sort: 'self', conf: 0.866, edge: 'background_check', role: 'oversight', deg: 7 },
    { id: 'usao_edmi', label: 'US Attorney (ED)', sort: 'self', conf: 0.99, edge: 'referral_pending', role: 'oversight', deg: 2 },
    { id: 'wayne_resa', label: 'Wayne RESA', sort: 'self', conf: 0.956, edge: 'failed_to_stop', role: 'oversight', deg: 6 },
    { id: 'sbm', label: 'State Bar', sort: 'self', conf: 0.99, edge: 'inaction', role: 'oversight', deg: 1 },

    // INVESTIGATION (4)
    { id: 'clutch_justice', label: 'Clutch Justice', sort: 'self', conf: 0.82, edge: 'investigation', role: 'investigation', deg: 4 },
    { id: 'ross_jones', label: 'Ross Jones', sort: 'self', conf: 0.862, edge: 'investigation', role: 'investigation', deg: 3 },
    { id: 'jolia_hill', label: 'Dr. Jolia Hill', sort: 'partial', conf: 0.99, edge: 'investigation', role: 'investigation', deg: 7 },
    { id: 'snyder_nikki', label: 'Nikki Snyder', sort: 'self', conf: 0.85, edge: 'investigation', role: 'investigation', deg: 2 },

    // DARK MONEY — the mobius circuit
    { id: 'walton_family_foundation', label: 'Walton Foundation', sort: 'partial', conf: 0.84, edge: 'inaction, funding', role: 'darkmoney', deg: 9 },
    { id: 'betsy_devos', label: 'Betsy DeVos', sort: 'partial', conf: 0.806, edge: 'charter system', role: 'darkmoney', deg: 6 },
    { id: 'devos_foundation', label: 'DeVos Foundation', sort: 'partial', conf: 0.8, edge: 'funding', role: 'darkmoney', deg: 4 },
    { id: 'the_74', label: 'The 74', sort: 'partial', conf: 0.8, edge: 'media', role: 'darkmoney', deg: 8 },
    { id: 'dykema', label: 'Dykema Gossett', sort: 'partial', conf: 0.9, edge: 'charter law', role: 'darkmoney', deg: 6 },
    { id: 'afc', label: 'AFC', sort: 'partial', conf: 0.8, edge: 'lobbying', role: 'darkmoney', deg: 10 },
    { id: 'roland_martin', label: 'Roland Martin', sort: 'null', conf: 0.818, edge: 'coverage', role: 'darkmoney', deg: 6 },
    { id: 'naacp_detroit', label: 'NAACP Detroit', sort: 'null', conf: 0.84, edge: 'advocacy', role: 'darkmoney', deg: 6 },
    { id: 'barton_malow', label: 'Barton Malow', sort: 'partial', conf: 0.817, edge: 'contractor', role: 'darkmoney', deg: 6 },
    { id: 'facebook_meta', label: 'Facebook/Meta', sort: 'null', conf: 0.5, edge: 'triadic_closure', role: 'darkmoney', deg: 5 },

    // OTHER
    { id: 'holland', label: 'Joseph Holland Jr.', sort: 'partial', conf: 0.863, edge: 'exploitation', role: 'other', deg: 15 },
    { id: 'mccastle', label: 'Gerald McCastle', sort: 'null', conf: 0.99, edge: 'payment', role: 'other', deg: 3 },
    { id: 'mckinney', label: 'Billy McKinney', sort: 'null', conf: 0.83, edge: 'payment', role: 'other', deg: 2 },
    { id: 'gordon', label: 'Jason Gordon', sort: 'partial', conf: 0.82, edge: 'corruption', role: 'other', deg: 2 },
    { id: 'plante_moran', label: 'Plante Moran', sort: 'null', conf: 0.97, edge: 'complicit_silence', role: 'other', deg: 21 },
    { id: 'evans', label: 'Warren Evans', sort: 'null', conf: 0.875, edge: 'mentorship', role: 'other', deg: 2 },
    { id: 'dumas', label: 'Karen Dumas', sort: 'null', conf: 0.99, edge: 'political', role: 'other', deg: 3 },
    { id: 'dasean_mitchell', label: 'Dasean Mitchell', sort: 'null', conf: 0.83, edge: 'impersonated_child', role: 'victim', deg: 2 },
  ];

  // ═══ THE WEB — 293 cross-connections between circle members ═══
  // Compiled from graph.json: governance, money, employment, family, investigation, political, legal, info
  var WEB = [
    // MONEY flows
    { f: 'purpose_group', t: 'banks', c: 'money' }, { f: 'pca', t: 'purpose_group', c: 'money' },
    { f: 'macdowell', t: 'banks', c: 'money' }, { f: 'macdowell', t: 'purpose_group', c: 'money' },
    { f: 'macdowell', t: 'cmu', c: 'money' }, { f: 'walton_family_foundation', t: 'pca', c: 'money' },
    { f: 'walton_family_foundation', t: 'the_74', c: 'money' }, { f: 'walton_family_foundation', t: 'roland_martin', c: 'money' },
    { f: 'devos_foundation', t: 'afc', c: 'money' }, { f: 'devos_foundation', t: 'the_74', c: 'money' },
    { f: 'inner_link', t: 'banks', c: 'money' }, { f: 'inner_link', t: 'yancey', c: 'money' },
    { f: 'mccastle', t: 'banks', c: 'money' }, { f: 'mccastle', t: 'gay_dagnogo', c: 'money' },
    { f: 'mckinney', t: 'banks', c: 'money' }, { f: 'yancey', t: 'banks_strategy', c: 'money' },
    { f: 'yancey', t: 'inner_link', c: 'money' }, { f: 'gay_dagnogo', t: 'perkins_t', c: 'money' },
    { f: 'alan_young', t: 'macdowell', c: 'money' }, { f: 'miller', t: 'banks', c: 'money' },
    { f: 'plante_moran', t: 'pca', c: 'money' }, { f: 'plante_moran', t: 'purpose_foundation', c: 'money' },

    // GOVERNANCE / BOARD
    { f: 'banks', t: 'purpose_foundation', c: 'governance' }, { f: 'banks', t: 'anchor_rock', c: 'governance' },
    { f: 'banks', t: 'of_the_light', c: 'governance' }, { f: 'banks', t: 'free_flow', c: 'governance' },
    { f: 'banks', t: 'sun_community', c: 'governance' }, { f: 'banks', t: 'gl_upfitting', c: 'governance' },
    { f: 'banks', t: 'whitlowbanks', c: 'governance' }, { f: 'banks', t: 'banks_powerwash', c: 'governance' },
    { f: 'banks', t: 'b_rodericks', c: 'governance' }, { f: 'banks', t: 'ars_holdings', c: 'governance' },
    { f: 'banks', t: 'gl_vision', c: 'governance' }, { f: 'banks', t: 'city_hill', c: 'governance' },
    { f: 'banks', t: 'right_turn', c: 'governance' }, { f: 'banks', t: 'ofa', c: 'governance' },
    { f: 'miller', t: 'pca', c: 'governance' }, { f: 'miller', t: 'anchor_rock', c: 'governance' },
    { f: 'moreland', t: 'pca', c: 'governance' }, { f: 'wells_stallworth', t: 'macdowell', c: 'governance' },
    { f: 'misha_stallworth', t: 'dpscd', c: 'governance' }, { f: 'gay_dagnogo', t: 'dpscd', c: 'governance' },
    { f: 'sc_cavanagh', t: 'goetz', c: 'governance' }, { f: 'sc_cavanagh', t: 'jtc_ison', c: 'governance' },
    { f: 'sc_cavanagh', t: 'thomas_ryan', c: 'governance' },

    // COMPLICITY / BOARD
    { f: 'goetz', t: 'banks', c: 'complicity' }, { f: 'jtc_ison', t: 'banks', c: 'complicity' },
    { f: 'glenn_page', t: 'banks', c: 'complicity' }, { f: 'thomas_ryan', t: 'banks', c: 'complicity' },
    { f: 'agc_hickey', t: 'banks', c: 'complicity' }, { f: 'upl_cadotte', t: 'banks', c: 'complicity' },

    // EMPLOYMENT
    { f: 'beasley', t: 'pca', c: 'employment' }, { f: 'beasley', t: 'dpscd', c: 'employment' },
    { f: 'beasley', t: 'plante_moran', c: 'employment' }, { f: 'beasley', t: 'wayne_resa', c: 'employment' },
    { f: 'beasley', t: 'barton_malow', c: 'employment' }, { f: 'jason_perry_pca', t: 'pca', c: 'employment' },
    { f: 'chalcee_norwood', t: 'macdowell', c: 'employment' }, { f: 'goetz', t: 'ag_office', c: 'employment' },
    { f: 'renae_moore', t: 'mde', c: 'employment' }, { f: 'renae_moore', t: 'dykema', c: 'employment' },
    { f: 'dumas', t: 'duggan', c: 'employment' },

    // FAMILY
    { f: 'carol_banks', t: 'banks', c: 'family' }, { f: 'od_banks', t: 'banks', c: 'family' },
    { f: 'beasley', t: 'yancey', c: 'family' }, { f: 'jennifer_crump', t: 'crump_gibson', c: 'family' },
    { f: 'carolyn_kilpatrick', t: 'kwame', c: 'family' }, { f: 'alma_stallworth', t: 'stallworth_t', c: 'family' },
    { f: 'alma_stallworth', t: 'keith_stallworth', c: 'family' }, { f: 'alma_stallworth', t: 'wells_stallworth', c: 'family' },
    { f: 'stallworth_t', t: 'misha_stallworth', c: 'family' }, { f: 'sean_perkins', t: 'todd_perkins', c: 'family' },
    { f: 'banks', t: 'holland', c: 'family' }, { f: 'holland', t: 'banks_living_trust', c: 'family' },

    // INVESTIGATION / OVERSIGHT
    { f: 'ag_office', t: 'banks', c: 'investigation' }, { f: 'clutch_justice', t: 'banks', c: 'investigation' },
    { f: 'clutch_justice', t: 'pca', c: 'investigation' }, { f: 'clutch_justice', t: 'macdowell', c: 'investigation' },
    { f: 'jolia_hill', t: 'banks', c: 'investigation' }, { f: 'jolia_hill', t: 'pca', c: 'investigation' },
    { f: 'jolia_hill', t: 'mde', c: 'investigation' }, { f: 'ross_jones', t: 'banks', c: 'investigation' },
    { f: 'snyder_nikki', t: 'banks', c: 'investigation' }, { f: 'snyder_nikki', t: 'mde', c: 'investigation' },
    { f: 'mde', t: 'pca', c: 'investigation' }, { f: 'mde', t: 'macdowell', c: 'investigation' },

    // INACTION / FAILURE
    { f: 'agc', t: 'banks', c: 'inaction' }, { f: 'jtc', t: 'banks', c: 'inaction' },
    { f: 'adb', t: 'banks', c: 'inaction' }, { f: 'sbm', t: 'banks', c: 'inaction' },
    { f: 'mde', t: 'banks', c: 'inaction' }, { f: 'nessel', t: 'banks', c: 'inaction' },
    { f: 'walton_family_foundation', t: 'banks', c: 'inaction' },
    { f: 'dpscd', t: 'banks', c: 'inaction' }, { f: 'dpscd', t: 'pca', c: 'inaction' },
    { f: 'wayne_resa', t: 'banks', c: 'inaction' }, { f: 'wayne_resa', t: 'pca', c: 'inaction' },

    // POLITICAL
    { f: 'gay_dagnogo', t: 'banks', c: 'political' }, { f: 'sheffield', t: 'banks', c: 'political' },
    { f: 'kwame', t: 'banks', c: 'political' }, { f: 'bert_johnson', t: 'banks', c: 'political' },
    { f: 'alice_thompson', t: 'banks', c: 'political' }, { f: 'duggan', t: 'banks', c: 'political' },
    { f: 'eastside_slate', t: 'banks', c: 'political' }, { f: 'evans', t: 'banks', c: 'political' },
    { f: 'gay_dagnogo', t: 'kwame', c: 'political' }, { f: 'bert_johnson', t: 'kwame', c: 'political' },
    { f: 'kwame', t: 'pugh', c: 'political' }, { f: 'duggan', t: 'sheffield', c: 'political' },

    // LEGAL
    { f: 'crump_gibson', t: 'banks', c: 'legal' }, { f: 'moreland', t: 'banks', c: 'legal' },
    { f: 'perkins_law', t: 'banks', c: 'legal' }, { f: 'perkins_t', t: 'banks', c: 'legal' },
    { f: 'todd_perkins', t: 'banks', c: 'legal' }, { f: 'langford_morris', t: 'banks', c: 'legal' },
    { f: 'yancey', t: 'banks', c: 'legal' }, { f: 'tremblay', t: 'banks', c: 'legal' },

    // INFO / COVERAGE
    { f: 'the_74', t: 'roland_martin', c: 'info' }, { f: 'roland_martin', t: 'naacp_detroit', c: 'info' },
    { f: 'roland_martin', t: 'banks', c: 'info' }, { f: 'the_74', t: 'pca', c: 'info' },
    { f: 'naacp_detroit', t: 'banks', c: 'info' }, { f: 'alice_thompson', t: 'naacp_detroit', c: 'info' },

    // CHARTER CRIME OVERLAP — goetz connects everything
    { f: 'pca', t: 'goetz', c: 'charter' }, { f: 'macdowell', t: 'goetz', c: 'charter' },
    { f: 'afc', t: 'goetz', c: 'charter' }, { f: 'betsy_devos', t: 'goetz', c: 'charter' },
    { f: 'cmu', t: 'goetz', c: 'charter' }, { f: 'plante_moran', t: 'goetz', c: 'charter' },
    { f: 'purpose_group', t: 'goetz', c: 'charter' }, { f: 'the_74', t: 'goetz', c: 'charter' },
    { f: 'gay_dagnogo', t: 'goetz', c: 'charter' }, { f: 'jolia_hill', t: 'goetz', c: 'charter' },

    // FACEBOOK TRIADIC
    { f: 'facebook_meta', t: 'afc', c: 'triadic' }, { f: 'facebook_meta', t: 'barton_malow', c: 'triadic' },
    { f: 'facebook_meta', t: 'cmu', c: 'triadic' }, { f: 'facebook_meta', t: 'pca', c: 'triadic' },
    { f: 'facebook_meta', t: 'plante_moran', c: 'triadic' },

    // KEY CROSS-CONNECTIONS
    { f: 'barton_malow', t: 'dpscd', c: 'contractor' }, { f: 'barton_malow', t: 'pca', c: 'charter' },
    { f: 'plante_moran', t: 'dpscd', c: 'audit' }, { f: 'plante_moran', t: 'dykema', c: 'institutional' },
    { f: 'plante_moran', t: 'yancey', c: 'audit' }, { f: 'betsy_devos', t: 'afc', c: 'governance' },
    { f: 'dykema', t: 'afc', c: 'legal' }, { f: 'nessel', t: 'ag_office', c: 'governance' },
    { f: 'nessel', t: 'sc_cavanagh', c: 'governance' }, { f: 'goetz', t: 'moreland', c: 'professional' },
    { f: 'crump_gibson', t: 'adb', c: 'governance' }, { f: 'holland', t: 'pca', c: 'exploitation' },
    { f: 'holland', t: 'purpose_group', c: 'exploitation' },
    { f: 'usao_edmi', t: 'banks', c: 'investigation' }, { f: 'usao_edmi', t: 'jtc', c: 'referral' },
    { f: 'pugh', t: 'banks', c: 'referral' },
    { f: 'dasean_mitchell', t: 'pca', c: 'victim' }, { f: 'banks', t: 'dasean_mitchell', c: 'violation' },
    { f: 'ms_perkins_pca', t: 'pca', c: 'employment' }, { f: 'ms_perkins_pca', t: 'beasley', c: 'gatekeeper' },
    { f: 'ms_perkins_pca', t: 'sean_perkins', c: 'family' },
  ];

  // ═══ CATEGORY COLORS ═══
  var CAT_COLORS = {
    money: '#f85149', governance: '#f0883e', complicity: '#ff7b72',
    employment: '#d29922', family: '#d2a8ff', investigation: '#3fb950',
    inaction: '#484f58', political: '#d29922', legal: '#58a6ff',
    info: '#58a6ff', charter: '#f0883e', triadic: '#8b949e',
    contractor: '#8b949e', audit: '#8b949e', institutional: '#484f58',
    professional: '#484f58', exploitation: '#ff7b72', victim: '#ff7b72',
    violation: '#f85149', referral: '#484f58', gatekeeper: '#f85149',
  };
  var ROLE_COLORS = {
    entity: '#f85149', family: '#d2a8ff', board: '#ff7b72', employee: '#d29922',
    political: '#d29922', legal: '#58a6ff', judge: '#58a6ff', oversight: '#3fb950',
    investigation: '#3fb950', darkmoney: '#f0883e', other: '#484f58', victim: '#ff7b72',
  };
  var SORT_COLORS = { 'non-self': '#f85149', self: '#3fb950', partial: '#f0883e', 'null': '#484f58' };

  // ═══ STATE ═══
  var _canvas, _ctx, _active = false, _animId;
  var _t = 0, _lastT = 0;
  var _addEntry = null;
  var _hoveredNode = -1;
  var _phase = 0; // 0=fleet, 1=bounce, 2=scatter, 3=web
  var _phaseStart = 0;
  var _friendPositions = [];
  var _idToIdx = {};

  function layoutFriends(W, H) {
    var cx = W / 2, cy = H / 2;
    _friendPositions = [];
    _idToIdx = {};
    var groups = {};
    FRIENDS.forEach(function(f) { if (!groups[f.role]) groups[f.role] = []; groups[f.role].push(f); });
    var roleOrder = ['entity', 'family', 'board', 'employee', 'political', 'legal', 'judge', 'oversight', 'investigation', 'darkmoney', 'other', 'victim'];
    var usedRoles = roleOrder.filter(function(r) { return groups[r] && groups[r].length > 0; });
    var sliceAngle = (Math.PI * 2) / usedRoles.length;
    var angleOffset = -Math.PI / 2;

    usedRoles.forEach(function(role, gi) {
      var group = groups[role];
      var groupAngle = angleOffset + gi * sliceAngle;
      var groupR = Math.min(W, H) * 0.3;

      group.forEach(function(f, fi) {
        var spread = (fi / Math.max(group.length - 1, 1) - 0.5) * sliceAngle * 0.75;
        var degFactor = Math.min(f.deg / 51, 1);
        var r = groupR * (0.4 + degFactor * 0.5 + (Math.sin(fi * 1.618) * 0.1));
        var a = groupAngle + spread;
        var idx = _friendPositions.length;
        _idToIdx[f.id] = idx;
        _friendPositions.push({ friend: f, x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, groupAngle: groupAngle, role: role });
      });
    });
  }

  function render(timestamp) {
    if (!_active) return;
    var dt = _lastT ? timestamp - _lastT : 16;
    _lastT = timestamp;
    _t += dt * 0.001;
    var W = _canvas.width, H = _canvas.height;
    var cx = W / 2, cy = H / 2;
    _ctx.clearRect(0, 0, W, H);
    _ctx.fillStyle = '#0d1117';
    _ctx.fillRect(0, 0, W, H);

    var phaseTime = _t - _phaseStart;
    if (_phase === 0 && phaseTime > 2.5) { _phase = 1; _phaseStart = _t; }
    if (_phase === 1 && phaseTime > 1.5) { _phase = 2; _phaseStart = _t; }
    if (_phase === 2 && phaseTime > 2.5) { _phase = 3; _phaseStart = _t; }
    phaseTime = _t - _phaseStart;

    // ═══ PHASE 0: FLEET TRACE ═══
    if (_phase <= 1) {
      var traceAlpha = _phase === 0 ? Math.min(phaseTime * 0.4, 0.5) : Math.max(0, 0.5 - phaseTime * 0.3);
      _ctx.globalAlpha = traceAlpha;
      _ctx.strokeStyle = '#58a6ff'; _ctx.lineWidth = 2;
      _ctx.beginPath(); _ctx.moveTo(cx - 100, 0); _ctx.lineTo(cx, cy); _ctx.stroke();
      _ctx.strokeStyle = '#f0883e'; _ctx.lineWidth = 1.5;
      _ctx.beginPath(); _ctx.moveTo(cx + 100, 0); _ctx.lineTo(cx, cy); _ctx.stroke();
      _ctx.fillStyle = '#58a6ff'; _ctx.font = '9px monospace'; _ctx.textAlign = 'center';
      _ctx.fillText('Meta \u00b7 322K req \u00b7 Menlo Park', cx - 100, 18);
      _ctx.fillStyle = '#f0883e';
      _ctx.fillText('Facebook \u00b7 1,364 req \u00b7 846 IPs', cx + 100, 18);
      _ctx.fillStyle = '#484f58'; _ctx.font = '8px monospace';
      _ctx.fillText('Zuckerberg \u2192 facebook_meta \u2192 5 circuit entities', cx, 35);
    }

    // ═══ PHASE 1: BOUNCE ═══
    if (_phase >= 1 && _phase <= 2) {
      var ba = _phase === 1 ? Math.min(phaseTime * 0.5, 0.6) : Math.max(0, 0.6 - phaseTime * 0.2);
      var br = _phase === 1 ? phaseTime * 80 : 25;
      _ctx.beginPath(); _ctx.arc(cx, cy, Math.min(br, 25), 0, Math.PI * 2);
      _ctx.fillStyle = '#f85149'; _ctx.globalAlpha = ba * 0.15; _ctx.fill();
      _ctx.strokeStyle = '#f85149'; _ctx.globalAlpha = ba; _ctx.lineWidth = 2; _ctx.stroke();
      if (_phase === 1) { _ctx.beginPath(); _ctx.arc(cx, cy, br, 0, Math.PI * 2); _ctx.globalAlpha = Math.max(0, 0.2 - br * 0.001); _ctx.lineWidth = 1; _ctx.stroke(); }
    }

    // Banks center label
    if (_phase >= 1) {
      _ctx.globalAlpha = _phase >= 3 ? 0.3 : 0.5;
      _ctx.fillStyle = '#f85149'; _ctx.font = 'bold 10px monospace'; _ctx.textAlign = 'center';
      _ctx.fillText('\u2620 Banks', cx, cy - 22);
      _ctx.globalAlpha *= 0.5; _ctx.font = '7px monospace';
      _ctx.fillText('121 web connections', cx, cy - 12);
    }

    // ═══ SCATTER + WEB ═══
    if (_phase >= 2) {
      var scatterP = _phase === 2 ? Math.min(phaseTime / 2, 1) : 1;
      scatterP = scatterP * scatterP * (3 - 2 * scatterP);
      var webP = _phase === 3 ? Math.min(phaseTime / 3, 1) : 0;

      // Draw web edges first (behind nodes)
      if (webP > 0) {
        WEB.forEach(function(w, wi) {
          var fi = _idToIdx[w.f];
          var ti = _idToIdx[w.t];
          if (fi === undefined || ti === undefined) return;
          var fp = _friendPositions[fi];
          var tp = _friendPositions[ti];
          if (!fp || !tp) return;

          var highlighted = _hoveredNode >= 0 && (_hoveredNode === fi || _hoveredNode === ti);
          var stagger = Math.min((webP * WEB.length - wi) / 3, 1);
          if (stagger <= 0) return;

          _ctx.beginPath();
          _ctx.moveTo(cx + (fp.x - cx) * scatterP, cy + (fp.y - cy) * scatterP);
          _ctx.lineTo(cx + (tp.x - cx) * scatterP, cy + (tp.y - cy) * scatterP);
          _ctx.strokeStyle = CAT_COLORS[w.c] || '#484f58';
          _ctx.globalAlpha = highlighted ? 0.35 : (_hoveredNode >= 0 ? 0.01 : 0.04 * stagger);
          _ctx.lineWidth = highlighted ? 1.5 : 0.5;
          _ctx.stroke();
        });
      }

      // Banks-to-friend lines
      _friendPositions.forEach(function(fp, i) {
        var curX = cx + (fp.x - cx) * scatterP;
        var curY = cy + (fp.y - cy) * scatterP;
        var hovered = _hoveredNode === i;
        _ctx.beginPath(); _ctx.moveTo(cx, cy); _ctx.lineTo(curX, curY);
        _ctx.strokeStyle = ROLE_COLORS[fp.role] || '#484f58';
        _ctx.globalAlpha = hovered ? 0.2 : (webP > 0 ? 0.01 : 0.04);
        _ctx.lineWidth = 1; _ctx.stroke();
      });

      // Nodes
      _friendPositions.forEach(function(fp, i) {
        var f = fp.friend;
        var curX = cx + (fp.x - cx) * scatterP;
        var curY = cy + (fp.y - cy) * scatterP;
        var hovered = _hoveredNode === i;
        var nodeR = hovered ? 8 : Math.max(2, Math.min(f.deg * 0.3, 6));

        _ctx.beginPath(); _ctx.arc(curX, curY, nodeR, 0, Math.PI * 2);
        _ctx.fillStyle = SORT_COLORS[f.sort] || '#484f58';
        _ctx.globalAlpha = hovered ? 0.4 : 0.15;
        _ctx.fill();
        _ctx.strokeStyle = ROLE_COLORS[fp.role] || '#484f58';
        _ctx.globalAlpha = hovered ? 0.8 : 0.3;
        _ctx.lineWidth = hovered ? 2 : 1;
        _ctx.stroke();

        _ctx.globalAlpha = hovered ? 0.8 : (webP > 0 ? 0.12 : 0.15 * scatterP);
        _ctx.fillStyle = '#c9d1d9';
        _ctx.font = (hovered ? '9px' : '6px') + ' monospace';
        _ctx.textAlign = 'center';
        _ctx.fillText(f.label, curX, curY + nodeR + 7);

        if (hovered) {
          _ctx.globalAlpha = 0.5; _ctx.fillStyle = SORT_COLORS[f.sort] || '#8b949e'; _ctx.font = '8px monospace';
          _ctx.fillText(f.sort + ' ' + (f.conf * 100).toFixed(0) + '% \u00b7 ' + f.deg + ' web connections \u00b7 ' + f.edge, curX, curY + nodeR + 18);
        }
      });

      // Role labels
      if (scatterP > 0.7) {
        var drawn = {};
        _friendPositions.forEach(function(fp) {
          if (drawn[fp.role]) return; drawn[fp.role] = true;
          var lr = Math.min(W, H) * 0.4;
          var lx = cx + Math.cos(fp.groupAngle) * lr;
          var ly = cy + Math.sin(fp.groupAngle) * lr;
          _ctx.globalAlpha = 0.15; _ctx.fillStyle = ROLE_COLORS[fp.role] || '#8b949e';
          _ctx.font = '8px monospace'; _ctx.textAlign = 'center';
          var labels = { entity: 'organizations (20)', family: 'family', board: 'board (6)', employee: 'employees (6)',
            political: 'political (16)', legal: 'legal (6)', judge: 'judges (5)', oversight: 'oversight (11)',
            investigation: 'investigators (4)', darkmoney: 'dark money (10)', other: 'other', victim: 'victim' };
          _ctx.fillText(labels[fp.role] || fp.role, lx, ly);
        });
      }
    }

    // ═══ TITLE ═══
    var titles = [
      'tracing fleet back to Menlo Park\u2026',
      '\u2620 Banks. 9 convictions. 121 web connections.',
      'scattering ' + FRIENDS.length + ' friends\u2026',
      '\u2620 the web \u2014 ' + WEB.length + ' cross-connections between ' + FRIENDS.length + ' circle members',
    ];
    _ctx.globalAlpha = 0.4; _ctx.fillStyle = '#c9d1d9'; _ctx.font = '11px monospace'; _ctx.textAlign = 'center';
    _ctx.fillText(titles[_phase] || titles[3], cx, H - 44);

    // Stats
    _ctx.globalAlpha = 0.12; _ctx.font = '8px monospace';
    _ctx.fillText(FRIENDS.length + ' circle members \u00b7 ' + WEB.length + ' cross-connections \u00b7 hover to trace', cx, H - 28);

    // Footer
    _ctx.globalAlpha = 0.2; _ctx.fillStyle = '#8b949e'; _ctx.font = '9px monospace';
    _ctx.fillText('hover to inspect \u00b7 click to replay \u00b7 ESC close \u00b7 /sheepwolves /mobius', cx, H - 12);

    _animId = requestAnimationFrame(render);
  }

  function handleMove(e) {
    if (!_active || !_canvas || _phase < 2) return;
    var rect = _canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (_canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (_canvas.height / rect.height);
    _hoveredNode = -1;
    for (var i = 0; i < _friendPositions.length; i++) {
      var fp = _friendPositions[i];
      var dist = Math.sqrt((mx - fp.x) * (mx - fp.x) + (my - fp.y) * (my - fp.y));
      if (dist < 18) { _hoveredNode = i; break; }
    }
    _canvas.style.cursor = _hoveredNode >= 0 ? 'pointer' : 'default';
  }

  function handleClick() { if (_active) { _phase = 0; _phaseStart = _t; } }

  function handleKey(e) { if (_active && e.key === 'Escape') deactivate(); }

  function activate(addEntry) {
    if (_active) { deactivate(); return; }
    _active = true; _addEntry = addEntry; _lastT = 0; _t = 0; _phase = 0; _phaseStart = 0; _hoveredNode = -1;
    _canvas = document.createElement('canvas');
    _canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:100;cursor:default';
    _canvas.width = window.innerWidth; _canvas.height = window.innerHeight;
    document.body.appendChild(_canvas); _ctx = _canvas.getContext('2d');
    layoutFriends(_canvas.width, _canvas.height);
    _canvas.addEventListener('mousemove', handleMove);
    _canvas.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKey);
    var rh = function() { if (_canvas) { _canvas.width = window.innerWidth; _canvas.height = window.innerHeight; layoutFriends(_canvas.width, _canvas.height); } };
    window.addEventListener('resize', rh); _canvas._rh = rh;
    _animId = requestAnimationFrame(render);
  }

  function deactivate() {
    _active = false;
    if (_animId) cancelAnimationFrame(_animId);
    if (_canvas) {
      _canvas.removeEventListener('mousemove', handleMove);
      _canvas.removeEventListener('click', handleClick);
      if (_canvas._rh) window.removeEventListener('resize', _canvas._rh);
      if (_canvas.parentNode) _canvas.parentNode.removeChild(_canvas);
    }
    document.removeEventListener('keydown', handleKey);
    if (_addEntry) {
      var lines = [];
      lines.push('<span style="color:#58a6ff;font-weight:bold">\u2192 fleet traced \u2192 Banks \u2192 scatter \u2192 web compiled</span>');
      lines.push('');
      lines.push('<span style="color:#f85149">\u2620 ' + FRIENDS.length + ' circle members \u00b7 ' + WEB.length + ' cross-connections</span>');
      lines.push('');
      lines.push('<span class="dim">top connected:</span>');
      lines.push('  <span style="color:#f85149">Banks 121</span> \u00b7 <span style="color:#f85149">PCA 51</span> \u00b7 <span style="color:#484f58">Plante Moran 21</span> \u00b7 <span style="color:#f0883e">Nessel 19</span>');
      lines.push('  <span style="color:#f0883e">Goetz 18</span> \u00b7 <span style="color:#f0883e">Beasley 16</span> \u00b7 <span style="color:#f0883e">Holland 15</span> \u00b7 <span style="color:#f0883e">Gay-Dagnogo 13</span>');
      lines.push('');
      lines.push('<span class="dim">20 shell companies. 4 Stallworths. 5 judges. 11 oversight bodies.</span>');
      lines.push('<span class="dim">the web shows who connects to who. the membrane sees all of them.</span>');
      lines.push('');
      lines.push('<span class="dim">/mobius for the money loop \u00b7 /sheepwolves for classification \u00b7 /compress for overlay</span>');
      _addEntry('chipmunk', lines.join('\n'));
    }
  }

  window._scatterFriends = {
    activate: activate, deactivate: deactivate,
    isActive: function() { return _active; },
    FRIENDS: FRIENDS, WEB: WEB,
  };
})();
