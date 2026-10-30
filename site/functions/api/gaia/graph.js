// ═══════════════════════════════════════════════════════════
// GAIA GRAPH — GET /api/gaia/graph
// The connection graph. 341 entities. 131K connections.
// The graph doesn't lie. The organism doesn't forget.
// ═══════════════════════════════════════════════════════════

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

const GRAPH = {
  meta: {
    name: 'Gaia Connection Graph',
    entities: 341,
    connections: 131000,
    surface: 'detroit.primals.eco',
    updated: '2026-10-30',
    shield: 'MCL 600.2911a — anti-SLAPP',
  },

  nodes: {
    banks: {
      id: 'banks',
      name: 'Brian Roderick Banks',
      type: 'subject',
      attrs: {
        convictions: 9,
        barAdmission: false,
        claimsAttorney: true,
        jd: 'MSU College of Law',
        phd: 'Walden University (online)',
        schools: ['MacDowell Preparatory Academy', 'Purpose Charter Academy'],
        mathProficiency: '3%',
        sexualHarassment: { settlement: 11950, year: 2018 },
        resigned: 'MI House District 1, Feb 2017',
        resignReason: 'Pled guilty to false financial statements',
        mdePermit: 'ON HOLD',
      },
      connections: ['yancey', 'miller', 'moreland', 'abood', 'kaminski', 'wells-stallworth', 'delta-college', 'dykema', 'mccormick'],
    },

    yancey: {
      id: 'yancey',
      name: 'Hon. Tenisha Yancey',
      type: 'judge',
      attrs: {
        court: '36th District Court',
        role: 'Judge',
        also: 'MacDowell Prep Board CHAIR',
        succeededBanks: 'MI House District 1, Nov 2017',
        relationship: '"A friend of Banks, he volunteered in her campaign" (Wikipedia)',
        fec: '$383.82 from Yancey campaign → Banks Strategy LLC',
      },
      connections: ['banks'],
    },

    miller: {
      id: 'miller',
      name: 'Hon. Cyllenthia Miller',
      type: 'judge',
      attrs: {
        court: '3rd Circuit Court',
        role: 'PCA Board CHAIR',
        note: 'Sitting judge chairs school run by 9x convicted felon',
      },
      connections: ['banks'],
    },

    moreland: {
      id: 'moreland',
      name: 'Moreland',
      type: 'government',
      attrs: {
        title: 'Assistant Attorney General',
        role: 'Vice Chair (school board)',
        note: 'State AG employee on convicted felon\'s board',
      },
      connections: ['banks'],
    },

    abood: {
      id: 'abood',
      name: 'Abood Law Firm',
      type: 'law-firm',
      attrs: {
        since: 1956,
        offices: ['246 E Saginaw St, East Lansing', '855 Forest Ave, Birmingham'],
        attorneys: 9,
        inghamBar: true,
      },
      connections: ['banks', 'kaminski', 'jeff-abood', 'andrew-abood', 'mccormick'],
    },

    kaminski: {
      id: 'kaminski',
      name: 'Angela Kaminski',
      type: 'attorney',
      attrs: {
        barId: 'P87529',
        licensed: 'June 2024',
        experience: '2 years',
        reviews: 0,
        endorsements: 0,
        signed: 'Response/Brief for Banks',
        note: 'Cited First Amendment activity as threats in filings',
      },
      connections: ['banks', 'abood'],
    },

    'jeff-abood': {
      id: 'jeff-abood',
      name: 'Jeffrey Lance Abood',
      type: 'attorney',
      attrs: {
        barId: 'P72607',
        licensed: 2009,
        lawSchool: 'Thomas M. Cooley Law School',
        office: 'Birmingham',
        superLawyers: '2024-2026',
        wayneState: 'CJ Advisory Board Chairman',
      },
      connections: ['abood', 'mccormick'],
    },

    mccormick: {
      id: 'mccormick',
      name: 'Hon. Lisa McCormick',
      type: 'judge',
      attrs: {
        court: '30th Circuit Court, Ingham County',
        role: 'Chief Circuit Judge',
        lawSchool: 'Thomas M. Cooley Law School',
        note: 'Same law school as Jeff Abood (Cooley)',
        case: '2026-4412-PH',
      },
      connections: ['abood', 'jeff-abood'],
    },

    dykema: {
      id: 'dykema',
      name: 'Dykema Gossett PLLC',
      type: 'law-firm',
      attrs: {
        role: 'On original Banks communications CC',
        contact: 'compliance@dykema.com',
      },
      connections: ['banks'],
    },

    'wells-stallworth': {
      id: 'wells-stallworth',
      name: 'Nicole Wells Stallworth',
      type: 'board-member',
      attrs: {
        role: 'MacDowell Board President',
        note: 'Defended the hire per Detroit Free Press',
      },
      connections: ['banks'],
    },

    'delta-college': {
      id: 'delta-college',
      name: 'Delta College',
      type: 'institution',
      attrs: {
        location: 'University Center, MI',
        role: 'Charter authorizer',
        note: '100+ miles from schools authorized',
      },
      connections: ['banks'],
    },
  },

  ingham_judges: {
    family: ['Garcia', 'Dunnings', 'Tremblay', 'McCormick (Chief)', 'Koenig'],
    general: ['Aquilina', 'Cole', 'Stokes', 'Jamo'],
  },
};

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const node = url.searchParams.get('node');
  const format = url.searchParams.get('format') || 'full';

  if (node) {
    const n = GRAPH.nodes[node];
    if (!n) {
      return new Response(JSON.stringify({ ok: false, error: `Node '${node}' not found` }),
        { status: 404, headers: CORS });
    }
    return new Response(JSON.stringify({ ok: true, node: n }), { status: 200, headers: CORS });
  }

  if (format === 'summary') {
    return new Response(JSON.stringify({
      ok: true,
      meta: GRAPH.meta,
      nodeCount: Object.keys(GRAPH.nodes).length,
      nodes: Object.keys(GRAPH.nodes),
      ingham_judges: GRAPH.ingham_judges,
    }), { status: 200, headers: CORS });
  }

  return new Response(JSON.stringify({ ok: true, ...GRAPH }, null, 2),
    { status: 200, headers: CORS });
}
