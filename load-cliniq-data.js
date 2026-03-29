#!/usr/bin/env node
/**
 * ClinIQ v2 — Supabase Data Loader
 * Loads seed data for molecules, sponsors, deals, patents
 * Uses Supabase REST API (no direct TCP needed)
 *
 * Usage: node load-cliniq-data.js
 * Env:   SUPABASE_URL  SUPABASE_SERVICE_KEY
 */

const { execSync } = require('child_process');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://dftquoyxsvfsujeqhxdj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmdHF1b3l4c3Zmc3VqZXFoeGRqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQ0NTYyNywiZXhwIjoyMDkwMDIxNjI3fQ.0l6dIuoCSGzvPujwKgQxy9HzKR4KOJM8jv9w6Gk7urE';

// ── Seed Data ──────────────────────────────────────────────────
const MOLECULES = [
  {name:'Sotorasib',phase:'ph3',ta:'Oncology',indication:'NSCLC (KRAS G12C)',sponsor:'Amgen',moa:'KRAS Inhibitor',safety:'Low',patent:2031,bdos:78,bd:'Partnered',reg:'BT/ODD',upfront:'$150M',milestones:'$2.1B',royalty:'12%'},
  {name:'Lecanemab',phase:'ph4',ta:'CNS',indication:"Early Alzheimer's",sponsor:'Eisai/Biogen',moa:'Anti-Aβ mAb',safety:'Medium',patent:2033,bdos:71,bd:'Partnered',reg:'BT/Fast Track',upfront:'$1.3B',milestones:'N/A',royalty:'N/A'},
  {name:'Tirzepatide',phase:'ph4',ta:'Metabolic',indication:'T2D / Obesity',sponsor:'Eli Lilly',moa:'GIP/GLP-1 RA',safety:'Low',patent:2036,bdos:65,bd:'Proprietary',reg:'BT',upfront:'N/A',milestones:'N/A',royalty:'N/A'},
  {name:'Tezepelumab',phase:'ph4',ta:'Respiratory',indication:'Severe Asthma',sponsor:'AZ/Amgen',moa:'Anti-TSLP mAb',safety:'Low',patent:2032,bdos:68,bd:'Partnered',reg:'BT',upfront:'$550M',milestones:'$750M',royalty:'N/A'},
  {name:'Olutasidenib',phase:'ph2',ta:'Oncology',indication:'AML (IDH1 mut.)',sponsor:'Novo Nordisk (ex-Forma Tx)',moa:'IDH1 Inhibitor',safety:'Medium',patent:2034,bdos:84,bd:'Proprietary',reg:'ODD/Fast Track',upfront:'Acq $1.1B (2023)',milestones:'N/A',royalty:'N/A'},
  {name:'Pelabresib',phase:'ph3',ta:'Oncology',indication:'Myelofibrosis',sponsor:'Novartis (ex-MorphoSys)',moa:'BET Inhibitor',safety:'Medium',patent:2035,bdos:81,bd:'Proprietary',reg:'ODD',upfront:'Acq $2.9B (2024)',milestones:'N/A',royalty:'N/A'},
  {name:'Remibrutinib',phase:'ph2',ta:'Immunology',indication:'CLL / Autoimmune',sponsor:'Novartis',moa:'BTK Inhibitor',safety:'Low',patent:2036,bdos:72,bd:'Proprietary',reg:'–',upfront:'N/A',milestones:'N/A',royalty:'N/A'},
  {name:'Efimosfermin',phase:'ph2',ta:'Metabolic',indication:'NASH / MASH',sponsor:'89bio',moa:'FGF21 Analogue',safety:'Low',patent:2035,bdos:88,bd:'Available',reg:'Fast Track',upfront:'Est $120M',milestones:'Est $1.8B',royalty:'8-14%'},
  {name:'Sabutoclax',phase:'ph1',ta:'Oncology',indication:'Solid Tumors',sponsor:'Ascenta Tx',moa:'Pan-Bcl-2 Inhib.',safety:'High',patent:2030,bdos:62,bd:'Available',reg:'–',upfront:'Est $40M',milestones:'Est $800M',royalty:'8-12%'},
  {name:'Imetelstat',phase:'ph3',ta:'Oncology',indication:'MDS / MF',sponsor:'Geron Corp',moa:'Telomerase Inhib.',safety:'Medium',patent:2034,bdos:86,bd:'Available',reg:'ODD/Fast Track',upfront:'Est $300M',milestones:'Est $2.8B',royalty:'12-18%'},
  {name:'Fostamatinib',phase:'ph2',ta:'Immunology',indication:'ITP / Autoimmune',sponsor:'Rigel Pharma',moa:'SYK Inhibitor',safety:'Medium',patent:2031,bdos:74,bd:'Available',reg:'ODD',upfront:'Est $90M',milestones:'Est $1.1B',royalty:'10-15%'},
  {name:'Olpasiran',phase:'ph3',ta:'Cardiology',indication:'ASCVD (Lp(a)↑)',sponsor:'Amgen',moa:'siRNA (Lp(a))',safety:'Low',patent:2037,bdos:79,bd:'Proprietary',reg:'BT/Fast Track',upfront:'N/A',milestones:'N/A',royalty:'N/A'},
  {name:'Zilebesiran',phase:'ph3',ta:'Cardiology',indication:'Hypertension',sponsor:'Alnylam/Roche',moa:'siRNA (AGT)',safety:'Low',patent:2038,bdos:77,bd:'Partnered',reg:'Fast Track',upfront:'$310M',milestones:'$1.6B',royalty:'N/A'},
  {name:'Zanubrutinib',phase:'ph4',ta:'Oncology',indication:'B-cell Malignancies',sponsor:'BeiGene',moa:'BTK Inhibitor',safety:'Low',patent:2033,bdos:82,bd:'Partnered',reg:'BT',upfront:'$2.9B (Novartis)',milestones:'N/A',royalty:'N/A'},
  {name:'Volrustomig',phase:'ph2',ta:'Oncology',indication:'Solid Tumors (combo)',sponsor:'AstraZeneca',moa:'PD-1/CTLA-4 bsAb',safety:'Medium',patent:2038,bdos:76,bd:'Proprietary',reg:'BT',upfront:'N/A',milestones:'N/A',royalty:'N/A'},
  {name:'Ianalumab',phase:'ph3',ta:'Immunology',indication:"Sjögren's / SLE",sponsor:'Novartis',moa:'Anti-BAFF-R mAb',safety:'Low',patent:2037,bdos:80,bd:'Proprietary',reg:'BT',upfront:'N/A',milestones:'N/A',royalty:'N/A'},
  {name:'Elranatamab',phase:'ph2',ta:'Oncology',indication:'Multiple Myeloma',sponsor:'Pfizer',moa:'BCMA×CD3 BiTE',safety:'Medium',patent:2036,bdos:83,bd:'Proprietary',reg:'ODD/BT',upfront:'N/A',milestones:'N/A',royalty:'N/A'},
  {name:'Inavolisib',phase:'ph3',ta:'Oncology',indication:'HR+ Breast Cancer',sponsor:'Roche',moa:'PI3Kα Inhibitor',safety:'Medium',patent:2035,bdos:85,bd:'Proprietary',reg:'BT',upfront:'N/A',milestones:'N/A',royalty:'N/A'},
  {name:'KarXT',phase:'ph4',ta:'CNS',indication:'Schizophrenia',sponsor:'Karuna Tx (BMS)',moa:'M1/M4 agonist',safety:'Low',patent:2040,bdos:91,bd:'Acquired',reg:'BT',upfront:'$14B (M&A)',milestones:'N/A',royalty:'N/A'},
  {name:'Nipocalimab',phase:'ph3',ta:'Immunology',indication:'Myasthenia Gravis',sponsor:'J&J',moa:'FcRn Antagonist',safety:'Low',patent:2038,bdos:78,bd:'Proprietary',reg:'BT/ODD',upfront:'N/A',milestones:'N/A',royalty:'N/A'},
];

const SPONSORS = [
  {name:'Roche / Genentech',trial_count:412,bdos:94,region:'Europe',size:'big',revenue:'$58.7B',phase3_count:142,rev_note:'FY2024 actual (CHF-adj)',recent_acq:'Spark Tx 2019 ($4.3B)'},
  {name:'Novartis',trial_count:387,bdos:91,region:'Europe',size:'big',revenue:'$45.7B',phase3_count:128,rev_note:'FY2024 actual net sales',recent_acq:'MorphoSys 2024 ($2.9B)'},
  {name:'Johnson & Johnson',trial_count:364,bdos:89,region:'USA',size:'big',revenue:'$56.3B',phase3_count:118,rev_note:'FY2024 pharma segment',recent_acq:'Abiomed 2022 ($16.6B)'},
  {name:'AstraZeneca',trial_count:341,bdos:88,region:'Europe',size:'big',revenue:'$54.1B',phase3_count:112,rev_note:'FY2024 actual',recent_acq:'Alexion 2021 ($39B)'},
  {name:'Pfizer',trial_count:318,bdos:86,region:'USA',size:'big',revenue:'$58.5B',phase3_count:96,rev_note:'FY2024 (post-COVID decline)',recent_acq:'Seagen 2023 ($43B)'},
  {name:'Bristol Myers Squibb',trial_count:295,bdos:84,region:'USA',size:'big',revenue:'$47.2B',phase3_count:88,rev_note:'FY2024 actual',recent_acq:'Karuna 2024 ($14B)'},
  {name:'Merck & Co.',trial_count:277,bdos:83,region:'USA',size:'big',revenue:'$63.6B',phase3_count:82,rev_note:'FY2024 actual (Keytruda-driven)',recent_acq:'Prometheus Bio 2023 ($10.8B)'},
  {name:'Eli Lilly',trial_count:261,bdos:80,region:'USA',size:'big',revenue:'$45.0B',phase3_count:78,rev_note:'FY2024 actual (Mounjaro/Zepbound surge)',recent_acq:'Morphic Tx 2024 ($3.2B)'},
  {name:'BeiGene',trial_count:198,bdos:76,region:'Emerging',size:'mid',revenue:'$3.2B',phase3_count:62,rev_note:null,recent_acq:'–'},
  {name:'Agenus Inc.',trial_count:48,bdos:88,region:'USA',size:'small',revenue:'$0.2B',phase3_count:8,rev_note:null,recent_acq:'BD Target'},
  {name:'Blueprint Medicines',trial_count:62,bdos:85,region:'USA',size:'small',revenue:'$0.5B',phase3_count:14,rev_note:null,recent_acq:'BD Target'},
  {name:'Protagonist Tx',trial_count:38,bdos:72,region:'USA',size:'small',revenue:'$0.1B',phase3_count:6,rev_note:null,recent_acq:'BD Target'},
  {name:'Imago BioSciences',trial_count:22,bdos:82,region:'USA',size:'small',revenue:'$0.05B',phase3_count:4,rev_note:null,recent_acq:'Acq by MSD $1.35B'},
];

const DEALS = [
  {asset:'Zavegepant (Pfizer)',phase:'Phase III',ta:'CNS',deal_type:'Licensing',year:2024,upfront:'$500M',total_value:'$2.6B',royalty:'10-15%',acquirer:'Pfizer',target:'Biohaven'},
  {asset:'KarXT (BMS)',phase:'Phase III',ta:'CNS',deal_type:'Acquisition',year:2024,upfront:'$14B',total_value:'$14B',royalty:'N/A',acquirer:'Bristol Myers Squibb',target:'Karuna Tx'},
  {asset:'Seagen ADC Portfolio',phase:'Approved',ta:'Oncology',deal_type:'Acquisition',year:2023,upfront:'$43B',total_value:'$43B',royalty:'N/A',acquirer:'Pfizer',target:'Seagen'},
  {asset:'Prometheus IBD (PRA023)',phase:'Phase II',ta:'Immunology',deal_type:'Acquisition',year:2023,upfront:'$10.8B',total_value:'$10.8B',royalty:'N/A',acquirer:'Merck & Co.',target:'Prometheus Bio'},
  {asset:'GLP-1 Platform (mAb)',phase:'Phase I',ta:'Metabolic',deal_type:'Licensing',year:2023,upfront:'$85M',total_value:'$1.7B',royalty:'8-12%',acquirer:'Undisclosed',target:'Zealand Pharma'},
  {asset:'Ionis-AZ Cardio siRNA',phase:'Phase II',ta:'Cardiology',deal_type:'Co-Dev',year:2023,upfront:'$310M',total_value:'$1.6B',royalty:'N/A',acquirer:'AstraZeneca',target:'Alnylam'},
  {asset:'Morphic αvβ6/αvβ1 inhib',phase:'Phase II',ta:'Metabolic',deal_type:'Acquisition',year:2024,upfront:'$3.2B',total_value:'$3.2B',royalty:'N/A',acquirer:'Eli Lilly',target:'Morphic Tx'},
  {asset:'FLJ-001 (CD19 x CD3)',phase:'Phase I',ta:'Oncology',deal_type:'Licensing',year:2022,upfront:'$40M',total_value:'$900M',royalty:'12-18%',acquirer:'Undisclosed',target:'Emerging Biotech'},
  {asset:'Cobenfy (xanomeline)',phase:'Phase III',ta:'CNS',deal_type:'Licensing',year:2022,upfront:'$325M',total_value:'$1.9B',royalty:'Tiered',acquirer:'Pfizer',target:'Karuna Tx'},
  {asset:'ADC novel payload Ph2',phase:'Phase II',ta:'Oncology',deal_type:'Licensing',year:2024,upfront:'$200M',total_value:'$3.1B',royalty:'10-16%',acquirer:'AstraZeneca',target:'Fusion Pharma'},
];

const PATENTS = [
  {drug:'Eliquis (apixaban)',expiry:2026,revenue_bn:18.2,color:'#e05252'},
  {drug:'Keytruda (pembrolizumab)',expiry:2028,revenue_bn:21.0,color:'#9b6dff'},
  {drug:'Jardiance (empagliflozin)',expiry:2027,revenue_bn:10.4,color:'#4a9eff'},
  {drug:'Dupixent (dupilumab)',expiry:2031,revenue_bn:11.6,color:'#00c6be'},
  {drug:'Ozempic/Wegovy (semaglutide)',expiry:2032,revenue_bn:13.9,color:'#c9a84c'},
  {drug:'Xarelto (rivaroxaban)',expiry:2026,revenue_bn:6.2,color:'#e05252'},
  {drug:'Eylea (aflibercept)',expiry:2027,revenue_bn:8.7,color:'#3cc98a'},
  {drug:'Skyrizi (risankizumab)',expiry:2033,revenue_bn:7.4,color:'#9b6dff'},
];

// ── REST API helpers ───────────────────────────────────────────
function curlUpsert(table, rows, conflictCol) {
  const url = `${SUPABASE_URL}/rest/v1/${table}`;
  const headers = [
    `-H "apikey: ${SUPABASE_KEY}"`,
    `-H "Authorization: Bearer ${SUPABASE_KEY}"`,
    `-H "Content-Type: application/json"`,
    `-H "Prefer: resolution=merge-duplicates,return=minimal"`,
  ].join(' ');

  const BATCH = 50;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const data = JSON.stringify(batch).replace(/'/g, "'\\''");
    const cmd = `curl -s -o /tmp/curl_out.txt -w "%{http_code}" -X POST "${url}" ${headers} -d '${data}'`;
    try {
      const code = execSync(cmd, { encoding: 'utf8' }).trim();
      if (code === '200' || code === '201') {
        inserted += batch.length;
        process.stdout.write(`  → ${table}: batch ${Math.floor(i/BATCH)+1} OK (${batch.length} rows)\n`);
      } else {
        const out = require('fs').readFileSync('/tmp/curl_out.txt', 'utf8');
        console.error(`  ✗ ${table} batch ${Math.floor(i/BATCH)+1} failed (HTTP ${code}):`, out.slice(0,200));
      }
    } catch (e) {
      console.error(`  ✗ ${table} batch error:`, e.message);
    }
  }
  return inserted;
}

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log(' ClinIQ v2 — Supabase Seed Loader');
  console.log('═══════════════════════════════════════════');
  console.log(`Target: ${SUPABASE_URL}`);
  console.log('');

  // Verify connection
  try {
    const cmd = `curl -s -o /dev/null -w "%{http_code}" "${SUPABASE_URL}/rest/v1/" -H "apikey: ${SUPABASE_KEY}"`;
    const code = execSync(cmd, { encoding: 'utf8' }).trim();
    if (code !== '200') {
      console.error(`Connection check failed: HTTP ${code}`);
      process.exit(1);
    }
    console.log('✓ Supabase REST API reachable');
  } catch (e) {
    console.error('Connection failed:', e.message);
    process.exit(1);
  }

  console.log('\nLoading molecules...');
  const m = curlUpsert('cliniq_molecules', MOLECULES, 'name');

  console.log('\nLoading sponsors...');
  const s = curlUpsert('cliniq_sponsors', SPONSORS, 'name');

  console.log('\nLoading deals...');
  const d = curlUpsert('cliniq_deals', DEALS, 'asset');

  console.log('\nLoading patents...');
  const p = curlUpsert('cliniq_patents', PATENTS, 'drug');

  console.log('\n═══════════════════════════════════════════');
  console.log(` Done: ${m} molecules | ${s} sponsors | ${d} deals | ${p} patents`);
  console.log('═══════════════════════════════════════════');
}

main().catch(console.error);
