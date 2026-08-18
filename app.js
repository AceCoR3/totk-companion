const typeInfo={
  shrine:{label:'Schreine',icon:'◇',color:'#55dce5'},tower:{label:'Kartografiertürme',icon:'♜',color:'#f2d56b'},lightroot:{label:'Wurzeln des Lichts',icon:'✹',color:'#b77bff'},korok:{label:'Krogs',icon:'✦',color:'#91d85e'},cave:{label:'Höhlen',icon:'⬡',color:'#e8a85b'},bubbul:{label:'Mayois',icon:'◉',color:'#67c7d2'},well:{label:'Brunnen',icon:'○',color:'#7bb5e8'},chasm:{label:'Abgründe',icon:'▽',color:'#e35b68'},location:{label:'Orte',icon:'⌖',color:'#d6d8ce'},hinox:{label:'Hinox',icon:'H',color:'#ff765f'},talus:{label:'Iwaroks',icon:'T',color:'#ff765f'},molduga:{label:'Moldoras',icon:'M',color:'#ff765f'},flux_construct:{label:'Blockkonstrukte',icon:'F',color:'#ff765f'},frox:{label:'Gigamas',icon:'R',color:'#ff765f'},gleeok:{label:'Griocks',icon:'G',color:'#ff765f'},old_map:{label:'Alte Karten',icon:'▧',color:'#c893ff'},sages_will:{label:'Wille der Weisen',icon:'S',color:'#c893ff'},addison:{label:'Birkda-Schilder',icon:'A',color:'#e5bc5c'},schema_stone:{label:'Bauplan-Steinplatten',icon:'◆',color:'#c893ff'},yiga_schematic:{label:'Yiga-Baupläne',icon:'Y',color:'#c893ff'},custom:{label:'Eigene Marker',icon:'•',color:'#ffffff'}
}
const layerTitles={surface:'Oberfläche',sky:'Himmel',depths:'Untergrund'};
const mapSources={surface:'assets/maps/surface-medium.png',sky:'assets/maps/sky-medium.png',depths:'assets/maps/depths-medium.png'};
const WORLD_MIN=-6000, WORLD_MAX=6000, MIN_ZOOM=1, MAX_ZOOM=7;
let currentLayer='surface',selectedId=null;
const load=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}};
let baseMarkers=Array.isArray(window.TOTK_BASE_MARKERS)?window.TOTK_BASE_MARKERS:[];
let importedMarkers=load('totk.importedMarkers',[]),customMarkers=load('totk.customMarkers',[]),completed=new Set(load('totk.completed',[]));
const FILTER_STATE_KEY='totk.enabledTypesByLayer.v1';
const savedFilterState=load(FILTER_STATE_KEY,{surface:[],sky:[],depths:[]});
const enabledTypesByLayer={
  surface:new Set(Array.isArray(savedFilterState.surface)?savedFilterState.surface:[]),
  sky:new Set(Array.isArray(savedFilterState.sky)?savedFilterState.sky:[]),
  depths:new Set(Array.isArray(savedFilterState.depths)?savedFilterState.depths:[])
};
const enabledTypes=()=>enabledTypesByLayer[currentLayer];
const saveFilterState=()=>localStorage.setItem(FILTER_STATE_KEY,JSON.stringify(Object.fromEntries(Object.entries(enabledTypesByLayer).map(([layer,set])=>[layer,[...set]]))));
const allMarkers=()=>[...baseMarkers,...importedMarkers,...customMarkers];

const $=id=>document.getElementById(id);
const mapViewport=$('mapViewport'),mapWorld=$('mapWorld'),mapImage=$('mapImage'),markerLayer=$('markerLayer'),placeLabelLayer=$('placeLabelLayer'),detailPanel=$('detailPanel'),filters=$('filters'),searchInput=$('searchInput'),hideCompleted=$('hideCompleted'),showPlaceLabels=$('showPlaceLabels');
const PLACE_LABEL_KEY='totk.showPlaceLabels.v10';
showPlaceLabels.checked=load(PLACE_LABEL_KEY,false)===true;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));


// --- Official German in-game name layer (v0.9) ---
const LOCALE_CACHE_KEY='totk.officialGermanNames.v1';
const OFFICIAL_DE_SEED={
  'Barula Plain':'Balume-Ebene','Apapes Lightroot':'Papez-Wurzel','Zakusu Shrine':'Saquzuk-Schrein',
  'Mayaotaki Shrine':'Maya-otaki-Schrein','East Castle Town':'Hyrule-Stadt Ost','Ancient Columns':'Antike Steinsäulen',
  'Hateno Village North Well':'Nordbrunnen von Hateno','Tatayam Lightroot':'Atat-ayam-Wurzel',
  'Simosiwak Shrine':'Simosi-waka-Schrein','Makurukis Shrine':'Maqru’kiza-Schrein','Mount Nabooru':'Naboru-Berg',
  'Gut Check Rock':'Schneidklippen','Akkala Sea Depths':'Meer von Akkala: Untergrund','Cresia Pit Mine':'Klecia-Bergbaumine',
  "Gloom’s Lair":'Miasma-Grotte','Pico Pond Cave':'Höhle am Minsh-See','Iayusus Lightroot':'Jayuzuz-Wurzel',
  'Yansamin Shrine':'Jan’samino-Schrein','Josiu Shrine':'Djosiu-Schrein','Hebra Peak':'Hebra-Gipfel',
  'Hateno Bay':'Hateno-Bucht','Lanayru Sea Sky':'Meer von Ranelle: Himmel','Mount Taran':'Terme-Berg',
  'Deya Lake':'Adeya-See','Yiga Clan Maritta Branch':'Yiga-Stützpunkt Maritta','Robred Dropoff Cave':'Höhle am Halbluth-Plateau',
  'Kegopa Lightroot':'Ekegopa-Wurzel','Ga-ahisas Shrine':'Ga’ahizaz-Schrein','Faron Sky':'Phirone-Luftraum',
  'Bargainer Statue':'Magierstatue','Hebra Great Skeleton':'Hebra-Riesenfossil','Walnot Mountain Cave':'Höhle am Magoni-Berg',
  "Tobio’s Hollow Chasm":'Abgrund am Bituo-Tal','Otak Shrine':'Otakka-Schrein','Hebra West Summit':'Hebra-Westspitze',
  'Hyrule Castle':'Schloss Hyrule','Akkala Span':'Brücke von Akkala','North Akkala Beach':'Küste von Nord-Akkala',
  'Mount Nabooru Cave':'Höhle im Naboru-Berg','Hebra Mountains Northwest Cave':'Nordwesthöhle der Hebra-Berge',
  'Miryotanog Shrine':'Mirjotanig-Schrein','Kaepora Pass':'Kepora-Pass','Lomei Labyrinth Island':'Irrland',
  'Gleeok Den':'Griock-Höhle','South Lomei Labyrinth':'Südliches Irrschloss','Brightcap Cave':'Leuchtpilzhöhle',
  'Muzasu Lightroot':'Mu-sazu-Wurzel','Kiuyoyou Shrine':'Kiujoj-u-Schrein','Kimayat Shrine':'Kima-jat-Schrein',
  'Spring of Wisdom':'Quelle der Weisheit','Uinoj Lightroot':'U’inoj-Wurzel','Coliseum Ruins':'Arena-Ruine',
  'Ekochiu Shrine':'Ekotsi’u-Schrein','Momosik Shrine':'Momosik-Schrein','Lucky Clover Gazette':'Kleeblatt-Kurier',
  'Rospro Pass Cave':'Höhle am Karuga-Pass','Katoij Lightroot':'O’iqatoijd-Wurzel','Tadarok Shrine':'Tadarok-un-Schrein',
  'Abandoned Lurelin Mine':'Verlassene Angelstedt-Mine','Ancient Zora Waterworks':'Antikes Zora-Heiligtum',
  'Karahatag Shrine':'Kara-hatagi-Schrein','Hyrule Castle Town Ruins':'Ruinen von Hyrule-Stadt',
  'Mihcihc Lightroot':'U’amtijt-Wurzel','Elma Knolls Chasm':'Abgrund der Ulmo-Anhöhe','Tenbez Shrine':'Temb’sai-Schrein',
  'Grove of Spirits':'Hain der Seelen','Washa’s Bluff':'Washa-Plateau','Exchange Ruins':'Alter Umschlagplatz',
  'Riverside Stable Well':'Brunnen am Stall am Fluss','Sikutamak Lightroot':'Asik-utmak-Wurzel',
  'Death Mountain Chasm':'Abgrund am Todesberg','Hyrule Castle Chasm':'Abgrund bei Schloss Hyrule',
  'Gemimik Shrine':'Gemimiq-Schrein','Yamiyo Shrine':'Ojami’o-Schrein','Abandoned Hateno Mine':'Verlassene Hateno-Mine',
  'Orochium Shrine':'Orotsi-um-Schrein','Rasitakiwak Shrine':'Rashtaki-waka-Schrein','Teniten Shrine':'Tendjiten-Schrein',
  'Goron City':'Goronia','Lightning Temple':'Donnertempel','Pagos Woods':'Zuguland-Wald',
  'Dueling Peaks Stable Well':'Brunnen am Stall der Zwillingsberge'
};
const OFFICIAL_DE_SHRINES_BY_COORD=[{"name":"Tadjiqats-Schrein","x":344.0,"y":-1009.0},{"name":"Joti-i’u-Schrein","x":4347.0,"y":2876.0},{"name":"Situmo’i-Schrein","x":2369.0,"y":2596.0},{"name":"Orom-waka-Schrein","x":-3079.0,"y":1617.0},{"name":"Maya-tsino’u-Schrein","x":-706.0,"y":-869.0},{"name":"Muzanqira-Schrein","x":408.0,"y":2134.0},{"name":"Ren-ise-Schrein","x":756.0,"y":824.0},{"name":"Zahirowa-Schrein","x":-3354.0,"y":2386.0},{"name":"Romtsuma-Schrein","x":-3407.0,"y":-1363.0},{"name":"Maya-matuno-Schrein","x":-4638.0,"y":-1513.0},{"name":"Zertab-mats-Schrein","x":-179.0,"y":1170.0},{"name":"Moga-waka-Schrein","x":3300.0,"y":424.0},{"name":"Sanmikka-Schrein","x":3470.0,"y":-2181.0},{"name":"Jiuk-um-Schrein","x":868.0,"y":-2278.0},{"name":"I’un-oroq-Schrein","x":-3539.0,"y":851.0},{"name":"Sorjotanig-Schrein","x":-3882.0,"y":-2963.0},{"name":"Maya-koq-Schrein","x":1270.0,"y":3733.0},{"name":"Gemimiq-Schrein","x":4513.0,"y":2116.0},{"name":"Orotsi-um-Schrein","x":-1637.0,"y":2642.0},{"name":"Sinaqa-waka-Schrein","x":-1415.0,"y":757.0},{"name":"Ta’ujosi-puni-Schrein","x":-4539.0,"y":2880.0},{"name":"Tsuqarok-Schrein","x":915.0,"y":-251.0},{"name":"Sikkudji-Schrein","x":699.0,"y":2793.0},{"name":"Siwakama-Schrein","x":-2446.0,"y":-3344.0},{"name":"Turaq-waka-Schrein","x":-3498.0,"y":-197.0},{"name":"Riogok-Schrein","x":-1441.0,"y":-1616.0},{"name":"Andamimka-Schrein","x":4232.0,"y":-2178.0},{"name":"Maya-usi’u-Schrein","x":-1167.0,"y":2602.0},{"name":"Ishodgun-Schrein","x":-879.0,"y":423.0},{"name":"Kiujoj-u-Schrein","x":-1107.0,"y":2088.0},{"name":"Ekotsi’u-Schrein","x":1063.0,"y":1280.0},{"name":"Tadarok-un-Schrein","x":-1082.0,"y":-2187.0},{"name":"Kara-hatagi-Schrein","x":-3728.0,"y":-3625.0},{"name":"Kisinona-Schrein","x":2568.0,"y":1246.0},{"name":"Oshosan-u-Schrein","x":-1404.0,"y":3678.0},{"name":"Gazaz-Schrein","x":-4153.0,"y":98.0},{"name":"Turaqamika-Schrein","x":-2657.0,"y":-2237.0},{"name":"Gata-kiza-Schrein","x":-3652.0,"y":1806.0},{"name":"Ihen-a-Schrein","x":3786.0,"y":578.0},{"name":"Tsutsu-um-Schrein","x":-1423.0,"y":-1351.0},{"name":"Kamtu-kisa-Schrein","x":3431.0,"y":3357.0},{"name":"Zepap-Schrein","x":222.0,"y":1085.0},{"name":"Maya-tata-Schrein","x":-3291.0,"y":-2512.0},{"name":"Zuzuyaj-Schrein","x":-785.0,"y":-434.0},{"name":"Apogeke-Schrein","x":3887.0,"y":-217.0},{"name":"Domsu’ino-Schrein","x":3305.0,"y":1443.0},{"name":"Kiqaqun-Schrein","x":-396.0,"y":2736.0},{"name":"Sibadj-taki’o-Schrein","x":2400.0,"y":3275.0},{"name":"Usshok-Schrein","x":670.0,"y":-3358.0},{"name":"Jikaiz-en-Schrein","x":4267.0,"y":-1673.0},{"name":"Kita-waka-Schrein","x":-1530.0,"y":-2929.0},{"name":"Zon’apano-Schrein","x":-1922.0,"y":-359.0},{"name":"Marak-gutsi-Schrein","x":1762.0,"y":2510.0},{"name":"Runa-kita-Schrein","x":-2530.0,"y":1170.0},{"name":"Wao-oza-Schrein","x":-4058.0,"y":1990.0},{"name":"Kjoqugoni-Schrein","x":-709.0,"y":-1551.0},{"name":"No-uda-Schrein","x":-2318.0,"y":2201.0},{"name":"Ejut-ume-Schrein","x":-3507.0,"y":3570.0},{"name":"Issim-Schrein","x":1842.0,"y":2842.0},{"name":"Maya-tjidegin-Schrein","x":3061.0,"y":1824.0},{"name":"Ottuma-Schrein","x":-4469.0,"y":-671.0},{"name":"Utodij-Schrein","x":1218.0,"y":-2543.0},{"name":"Kamisun-Schrein","x":-178.0,"y":-1558.0},{"name":"Zu’ari-waka-Schrein","x":-2524.0,"y":-1770.0},{"name":"Raka-kudadjit-Schrein","x":-2037.0,"y":-1853.0},{"name":"Rashtaki-waka-Schrein","x":4167.0,"y":1323.0},{"name":"Saquzuk-Schrein","x":3526.0,"y":-1482.0},{"name":"Djodjoni’u-Schrein","x":1202.0,"y":330.0},{"name":"Sif-mim-Schrein","x":2826.0,"y":-3270.0},{"name":"Otakka-Schrein","x":-4391.0,"y":3714.0},{"name":"Mirjotanig-Schrein","x":-4680.0,"y":-3086.0},{"name":"Kima-jat-Schrein","x":2864.0,"y":3638.0},{"name":"Momosik-Schrein","x":2960.0,"y":2758.0},{"name":"Igasuk-Schrein","x":4655.0,"y":3714.0},{"name":"Taqi’ihaban-Schrein","x":-1830.0,"y":1195.0},{"name":"En-omha-Schrein","x":103.0,"y":-2518.0},{"name":"Jomisuhk-Schrein","x":4413.0,"y":-613.0},{"name":"Maya-hishka-Schrein","x":3729.0,"y":-2059.0},{"name":"Motusij-Schrein","x":-1795.0,"y":-3487.0},{"name":"Ma’o’ik-zuk-Schrein","x":2276.0,"y":147.0},{"name":"Moshapin-Schrein","x":2679.0,"y":1904.0},{"name":"Uzas-um-Schrein","x":-2139.0,"y":-874.0},{"name":"Joni’u-Schrein","x":2918.0,"y":507.0},{"name":"Djiotaqi’o-Schrein","x":1834.0,"y":3180.0},{"name":"Iqatak-Schrein","x":-3951.0,"y":1139.0},{"name":"Tjitma’u-Schrein","x":-3211.0,"y":-3007.0},{"name":"Nindjisi-Schrein","x":355.0,"y":1892.0},{"name":"Tokjo’u-Schrein","x":2304.0,"y":-2378.0},{"name":"Zekunb-mar-Schrein","x":167.0,"y":2320.0},{"name":"Rutafu-um-Schrein","x":-2998.0,"y":3102.0},{"name":"O-ogin-Schrein","x":2756.0,"y":-1089.0},{"name":"Djogo-u-Schrein","x":3346.0,"y":-1187.0},{"name":"Maya-ri’ina-Schrein","x":4631.0,"y":-3712.0},{"name":"Pupunke-Schrein","x":621.0,"y":2211.0},{"name":"Bamitok-Schrein","x":3094.0,"y":-3210.0},{"name":"Irazak-Schrein","x":-4159.0,"y":-3825.0},{"name":"Kuraqat-Schrein","x":2361.0,"y":-511.0},{"name":"Zuzbi’e-Schrein","x":349.0,"y":-2052.0},{"name":"Eshoze-Schrein","x":1566.0,"y":-1945.0},{"name":"Ojami’o-Schrein","x":333.0,"y":470.0},{"name":"Tendjiten-Schrein","x":-75.0,"y":-1116.0},{"name":"Maya-otaki-Schrein","x":-825.0,"y":3535.0},{"name":"Maqru’kiza-Schrein","x":-2847.0,"y":630.0},{"name":"Sin-natakk-Schrein","x":3842.0,"y":2300.0},{"name":"Jotsisi’u-Schrein","x":931.0,"y":-1903.0},{"name":"Ishokin-Schrein","x":-565.0,"y":-3524.0},{"name":"Sizuran-Schrein","x":-2559.0,"y":3354.0},{"name":"Tenmat-en-Schrein","x":-595.0,"y":1551.0},{"name":"Iodsi-ihiga-Schrein","x":3811.0,"y":1219.0},{"name":"Makasura-Schrein","x":1770.0,"y":-1052.0},{"name":"Kjonnisiu-Schrein","x":-205.0,"y":451.0},{"name":"Tima-waka-Schrein","x":1800.0,"y":1640.0},{"name":"Jonzahu-Schrein","x":1744.0,"y":18.0},{"name":"Rasi-waka-Schrein","x":4664.0,"y":3263.0},{"name":"Kudani-zara-Schrein","x":-4167.0,"y":-2143.0},{"name":"Djodj’u-u-Schrein","x":1515.0,"y":-3577.0},{"name":"Djiosinih-Schrein","x":-241.0,"y":-371.0},{"name":"Gatanish-Schrein","x":4498.0,"y":826.0},{"name":"Molonok-Schrein","x":1182.0,"y":-779.0},{"name":"Minetakka-Schrein","x":394.0,"y":3485.0},{"name":"Raqasho-go-Schrein","x":-1715.0,"y":-2119.0},{"name":"Temb’sai-Schrein","x":-970.0,"y":3535.0},{"name":"Idjo-o-Schrein","x":-3861.0,"y":2682.0},{"name":"Maya-um’kiza-Schrein","x":-2948.0,"y":3051.0},{"name":"Jiru-tag’mats-Schrein","x":2916.0,"y":534.0},{"name":"Kada’unar-Schrein","x":1882.0,"y":1203.0},{"name":"Mogisari-Schrein","x":4655.0,"y":3500.0},{"name":"Sij-amotusi-Schrein","x":-1795.0,"y":-3295.0},{"name":"Uko-uho-Schrein","x":275.0,"y":-913.0},{"name":"Gutanbatji-Schrein","x":709.0,"y":-1383.0},{"name":"In-iza-Schrein","x":26.0,"y":-1504.0},{"name":"Natjo-yaha-Schrein","x":390.0,"y":-1661.0},{"name":"Maya-naji-Schrein","x":4613.0,"y":-947.0},{"name":"Igoshon-Schrein","x":3481.0,"y":666.0},{"name":"Djok-usini-Schrein","x":1075.0,"y":-3348.0},{"name":"Simosi-waka-Schrein","x":162.0,"y":1972.0},{"name":"Jan’samino-Schrein","x":2351.0,"y":-1783.0},{"name":"Kumma’ino-Schrein","x":2857.0,"y":-2856.0},{"name":"Gikaqun-Schrein","x":4506.0,"y":2166.0},{"name":"Kahatana-um-Schrein","x":-3296.0,"y":3432.0},{"name":"Djoqu-u-Schrein","x":1376.0,"y":-3340.0},{"name":"Natakka-Schrein","x":3671.0,"y":1484.0},{"name":"Ganoza-Schrein","x":-3370.0,"y":467.0},{"name":"Taunhijo-Schrein","x":-2402.0,"y":825.0},{"name":"Djosiu-Schrein","x":1758.0,"y":-1208.0},{"name":"Ga’ahizaz-Schrein","x":-3596.0,"y":961.0},{"name":"Djindoka’o-Schrein","x":-1257.0,"y":-1487.0},{"name":"Sihatsjog-u-Schrein","x":4546.0,"y":-846.0},{"name":"Maya-skiara-Schrein","x":-3547.0,"y":-321.0},{"name":"Maya-mi’i-Schrein","x":340.0,"y":2815.0},{"name":"Uko’ojisi-Schrein","x":1469.0,"y":-2169.0},{"name":"Tanino-ud-Schrein","x":-1802.0,"y":3407.0}];
const normalizeLocaleKey=s=>String(s??'').normalize('NFKC').replace(/[’‘`´]/g,"'").replace(/\s+/g,' ').trim().toLowerCase();
let deNameMap={};
function mergeGermanMap(obj){
  if(!obj||typeof obj!=='object')return;
  for(const [en,de] of Object.entries(obj)) if(en&&de) deNameMap[normalizeLocaleKey(en)]=String(de).trim();
}
mergeGermanMap(OFFICIAL_DE_SEED);
mergeGermanMap(load(LOCALE_CACHE_KEY,{}));
function reverseGermanShrineName(name){
  const base=String(name||'').replace(/-Schrein$/,'');
  const rev=[...base].reverse().join('').toLocaleLowerCase('de-DE');
  return (rev.charAt(0).toLocaleUpperCase('de-DE')+rev.slice(1))+'-Wurzel';
}
function applyCoordinateGermanNames(){
  const shrines=baseMarkers.filter(m=>m.type==='shrine');
  for(const m of shrines){
    let best=null,dist=Infinity;
    for(const g of OFFICIAL_DE_SHRINES_BY_COORD){const d=Math.hypot(m.x-g.x,m.y-g.y);if(d<dist){dist=d;best=g}}
    if(best&&dist<=5)deNameMap[normalizeLocaleKey(m.name_en||m.name)]=best.name;
  }
  // Every Depths lightroot mirrors the surface shrine directly above it. The root name is the shrine basename reversed.
  const surfaceShrines=shrines.filter(m=>m.layer==='surface');
  for(const r of baseMarkers.filter(m=>m.type==='lightroot')){
    let best=null,dist=Infinity;
    for(const s of surfaceShrines){const d=Math.hypot(r.x-s.x,r.y-s.y);if(d<dist){dist=d;best=s}}
    if(best&&dist<=5){const deShrine=deNameMap[normalizeLocaleKey(best.name_en||best.name)];if(deShrine)deNameMap[normalizeLocaleKey(r.name_en||r.name)]=reverseGermanShrineName(deShrine);}
  }
}
applyCoordinateGermanNames();
// Preserve already verified German names bundled in the dataset (e.g. towers).
for(const m of baseMarkers){ if(m.name_en&&m.name&&m.name!==m.name_en) deNameMap[normalizeLocaleKey(m.name_en)]=m.name; }
function markerName(m){
  if(!m)return'';
  const en=m.name_en||m.name;
  return deNameMap[normalizeLocaleKey(en)]||m.name||en||'Unbenannter Marker';
}
function namedKeys(){
  const keys=new Set();
  for(const m of baseMarkers){const en=m.name_en||m.name;if(en&&m.type!=='korok')keys.add(normalizeLocaleKey(en));}
  return keys;
}
function localizationStats(){
  const keys=namedKeys();let matched=0;for(const k of keys)if(deNameMap[k])matched++;
  return {matched,total:keys.size,pct:keys.size?Math.round(matched/keys.size*100):100};
}
function updateLocaleStatus(extra=''){
  const st=localizationStats(),el=$('localeStatus'),bar=$('localeMeterBar');
  if(el)el.textContent=`${st.matched}/${st.total} eindeutige Namen deutsch${extra?' · '+extra:''}`;
  if(bar)bar.style.width=st.pct+'%';
}
function extractGermanMapFromHtml(html){
  const doc=new DOMParser().parseFromString(html,'text/html'),out={};
  for(const tr of doc.querySelectorAll('tr')){
    const cells=[...tr.querySelectorAll('th,td')].map(x=>x.textContent.replace(/\s+/g,' ').trim());
    if(cells.length>=5){const en=cells[1],de=cells[4];if(en&&de&&!/^eng$/i.test(en)&&!/^deu$/i.test(de))out[en]=de;}
  }
  return out;
}
async function fetchLocalizationHtml(url){
  const r=await fetch(url,{cache:'no-store'}); if(!r.ok)throw new Error('HTTP '+r.status);
  const ct=r.headers.get('content-type')||'';
  if(ct.includes('json')){
    const j=await r.json();
    if(Array.isArray(j)){const v=j[0];return v?.content?.rendered||v?.content||'';}
    return j?.content?.rendered||j?.content||'';
  }
  return await r.text();
}
async function syncGermanNames(manual=false){
  const btn=$('syncLocale');if(btn)btn.disabled=true;
  const status=$('localeStatus');if(status)status.textContent='Offizielle deutsche Namen werden synchronisiert…';
  const sources=[
    'https://public-api.wordpress.com/rest/v1.1/sites/giocatorinintendo.wordpress.com/posts/slug:totk-text-dump-location',
    'https://giocatorinintendo.wordpress.com/wp-json/wp/v2/pages?slug=totk-text-dump-location&_fields=content',
    'https://giocatorinintendo.wordpress.com/text-dump/totk-text-dump-location/'
  ];
  let parsed=null,lastErr=null;
  for(const url of sources){
    try{const html=await fetchLocalizationHtml(url);const map=extractGermanMapFromHtml(html);if(Object.keys(map).length>500){parsed=map;break;}}
    catch(e){lastErr=e;}
  }
  if(parsed){
    const cache={...load(LOCALE_CACHE_KEY,{})};Object.assign(cache,parsed);localStorage.setItem(LOCALE_CACHE_KEY,JSON.stringify(cache));mergeGermanMap(parsed);
    updateLocaleStatus('Originaldaten synchronisiert');render();
  }else{
    updateLocaleStatus(manual?'Online-Sync nicht erreichbar':'Offline-Modus');
    if(manual)console.warn('Lokalisierung konnte nicht synchronisiert werden',lastErr);
  }
  if(btn)btn.disabled=false;
}

// The supplied 4500x4500 maps use a world square of roughly -6000..+6000.
// Our normalized marker data uses the in-game display convention: X/Y on the map plane, Z altitude.
function coordToPct(x,y){return{left:((x-WORLD_MIN)/(WORLD_MAX-WORLD_MIN))*100,top:(1-((y-WORLD_MIN)/(WORLD_MAX-WORLD_MIN)))*100}}
function inferType(o){const s=JSON.stringify(o).toLowerCase();if(s.includes('lightroot'))return'lightroot';if(s.includes('shrine')||s.includes('dungeon'))return'shrine';if(s.includes('korok'))return'korok';if(s.includes('bubbul'))return'bubbul';if(s.includes('cave'))return'cave';if(s.includes('chasm'))return'chasm';if(s.includes('well'))return'well';if(s.includes('gleeok'))return'gleeok';if(s.includes('hinox'))return'hinox';if(s.includes('talus'))return'talus';if(s.includes('frox'))return'frox';if(s.includes('molduga'))return'molduga';if(s.includes('flux'))return'flux_construct';return'custom'}
function num(...v){for(const x of v){const n=Number(x);if(Number.isFinite(n))return n}return 0}
function normalizeOne(o,i){const pos=o.Translate||o.translate||o.position||o.pos||{};const x=num(o.x,o.X,pos.x,pos.X,Array.isArray(pos)?pos[0]:undefined),y=num(o.y,o.Y,o.height,pos.y,pos.Y,Array.isArray(pos)?pos[1]:undefined),z=num(o.z,o.Z,o.zCoord,pos.z,pos.Z,Array.isArray(pos)?pos[2]:undefined);let layer=o.layer||o.map_type||o.level;if(!layer)layer=z<-100?'depths':z>=650?'sky':'surface';layer=String(layer).toLowerCase();if(layer.includes('depth'))layer='depths';else if(layer.includes('sky'))layer='sky';else layer='surface';return{id:String(o.id||o.completion_hash||o.hash_id||o.HashId||o.name||o.Name||('import-'+i)),name:String(o.display_name||o.name||o.Name||o.ui_name||o.actor||o.ActorName||'Unbenannter Marker'),type:o.type&&typeInfo[o.type]?o.type:inferType(o),layer,x,y,z,note:String(o.note||o.description||o.title||''),source:'import'}}
function flatten(data){if(Array.isArray(data))return data;if(data&&typeof data==='object'){for(const k of ['data','items','locations','markers','objects','results'])if(Array.isArray(data[k]))return data[k];const out=[];for(const [k,v] of Object.entries(data)){if(Array.isArray(v))v.forEach((item,i)=>out.push({...item,sourceCategory:k,id:item.id||`${k}-${i}`}));else if(v&&typeof v==='object')out.push({id:k,...v})}return out}return[]}

const view={zoom:1,x:0,y:0,baseSize:1000,dragging:false,startX:0,startY:0,startViewX:0,startViewY:0};
function fitMap(){
  const r=mapViewport.getBoundingClientRect();
  view.baseSize=Math.max(320,Math.min(r.width,r.height));
  mapWorld.style.width=view.baseSize+'px'; mapWorld.style.height=view.baseSize+'px';
  view.zoom=1; view.x=(r.width-view.baseSize)/2; view.y=(r.height-view.baseSize)/2;
  applyView(); if(markerLayer&&markerLayer.childNodes.length)renderMarkers();
}
function clampView(){
  const r=mapViewport.getBoundingClientRect(), size=view.baseSize*view.zoom;
  const margin=Math.min(120,Math.min(r.width,r.height)*.25);
  if(size<=r.width){view.x=(r.width-size)/2}else{view.x=Math.min(margin,Math.max(r.width-size-margin,view.x))}
  if(size<=r.height){view.y=(r.height-size)/2}else{view.y=Math.min(margin,Math.max(r.height-size-margin,view.y))}
}
function applyView(){
  clampView();
  mapWorld.style.setProperty('--invZoom',String(1/view.zoom));
  mapWorld.style.transform=`translate(${view.x}px,${view.y}px) scale(${view.zoom})`;
  $('zoomLevel').textContent=Math.round(view.zoom*100)+'%';
  schedulePlaceLabels();
}
function setZoom(newZoom,cx,cy){
  newZoom=Math.max(MIN_ZOOM,Math.min(MAX_ZOOM,newZoom));
  if(newZoom===view.zoom)return;
  const r=mapViewport.getBoundingClientRect();
  cx=(cx??(r.left+r.width/2))-r.left; cy=(cy??(r.top+r.height/2))-r.top;
  const ratio=newZoom/view.zoom;
  view.x=cx-(cx-view.x)*ratio; view.y=cy-(cy-view.y)*ratio; view.zoom=newZoom; applyView(); renderMarkers();
}
function panToCoordinate(x,y,targetZoom=Math.max(2.2,view.zoom)){
  const p=coordToPct(x,y),r=mapViewport.getBoundingClientRect();
  view.zoom=Math.max(MIN_ZOOM,Math.min(MAX_ZOOM,targetZoom));
  view.x=r.width/2-(p.left/100*view.baseSize*view.zoom);
  view.y=r.height/2-(p.top/100*view.baseSize*view.zoom);
  applyView();
}
mapViewport.addEventListener('wheel',e=>{e.preventDefault();setZoom(view.zoom*(e.deltaY<0?1.18:1/1.18),e.clientX,e.clientY)},{passive:false});
mapViewport.addEventListener('dblclick',e=>{if(!e.target.closest('.marker'))setZoom(view.zoom*1.65,e.clientX,e.clientY)});
const activePointers=new Map();let pinchState=null;

let lastMapTapTime=0,lastMapTapX=0,lastMapTapY=0;
function closeSelectedMarker(){
  if(selectedId!==null){
    selectedId=null;
    render();
  }
}
function zoomAtClientPoint(clientX,clientY,factor=1.7){
  const rect=mapViewport.getBoundingClientRect();
  const cx=clientX-rect.left,cy=clientY-rect.top;
  setZoom(Math.min(MAX_ZOOM,view.zoom*factor),cx,cy);
}
mapViewport.addEventListener('pointerdown',e=>{
  if(e.button!==0||e.target.closest('.marker,.map-controls'))return;
  activePointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  try{mapViewport.setPointerCapture(e.pointerId)}catch{}
  if(activePointers.size===1){view.dragging=true;view.startX=e.clientX;view.startY=e.clientY;view.startViewX=view.x;view.startViewY=view.y;mapViewport.classList.add('dragging')}
  if(activePointers.size===2){
    view.dragging=false;mapViewport.classList.remove('dragging');
    const pts=[...activePointers.values()],dx=pts[1].x-pts[0].x,dy=pts[1].y-pts[0].y;
    pinchState={distance:Math.hypot(dx,dy),zoom:view.zoom,cx:(pts[0].x+pts[1].x)/2,cy:(pts[0].y+pts[1].y)/2};
  }
});
let pointerRaf=0,lastPointerEvent=null;
mapViewport.addEventListener('pointermove',e=>{
  if(!activePointers.has(e.pointerId))return;
  activePointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  lastPointerEvent=e;
  if(pointerRaf)return;
  pointerRaf=requestAnimationFrame(()=>{
    pointerRaf=0;
    const ev=lastPointerEvent;
    if(!ev)return;
    if(activePointers.size>=2){
      const pts=[...activePointers.values()].slice(0,2),dx=pts[1].x-pts[0].x,dy=pts[1].y-pts[0].y,dist=Math.hypot(dx,dy);
      if(!pinchState||!pinchState.distance)return;
      const cx=(pts[0].x+pts[1].x)/2,cy=(pts[0].y+pts[1].y)/2;
      setZoom(pinchState.zoom*(dist/pinchState.distance),cx,cy);return;
    }
    if(!view.dragging)return;
    view.x=view.startViewX+(ev.clientX-view.startX);
    view.y=view.startViewY+(ev.clientY-view.startY);
    applyView();
  });
});
function endDrag(e){
  activePointers.delete(e.pointerId);try{mapViewport.releasePointerCapture(e.pointerId)}catch{}
  if(activePointers.size<2)pinchState=null;
  if(activePointers.size===1){const pt=[...activePointers.values()][0];view.dragging=true;view.startX=pt.x;view.startY=pt.y;view.startViewX=view.x;view.startViewY=view.y;mapViewport.classList.add('dragging');return}
  view.dragging=false;mapViewport.classList.remove('dragging');
}
mapViewport.addEventListener('pointerup',endDrag);mapViewport.addEventListener('pointercancel',endDrag);

mapViewport.addEventListener('dblclick',e=>{
  if(e.target.closest('.marker,.marker-cluster,.place-label,.detail-panel,.quick-map-layers'))return;
  e.preventDefault();
  zoomAtClientPoint(e.clientX,e.clientY,1.75);
});

mapViewport.addEventListener('click',e=>{
  if(e.target.closest('.marker,.marker-cluster,.place-label,.detail-panel,.quick-map-layers'))return;
  closeSelectedMarker();
});

mapViewport.addEventListener('pointerup',e=>{
  if(e.pointerType!=='touch')return;
  if(e.target.closest('.marker,.marker-cluster,.place-label,.detail-panel,.quick-map-layers'))return;
  const now=performance.now();
  const dx=e.clientX-lastMapTapX,dy=e.clientY-lastMapTapY;
  const near=Math.hypot(dx,dy)<32;
  if(now-lastMapTapTime<320 && near){
    e.preventDefault();
    lastMapTapTime=0;
    zoomAtClientPoint(e.clientX,e.clientY,1.75);
  }else{
    lastMapTapTime=now;
    lastMapTapX=e.clientX;
    lastMapTapY=e.clientY;
  }
});

$('zoomInBtn').onclick=()=>setZoom(view.zoom*1.35);$('zoomOutBtn').onclick=()=>setZoom(view.zoom/1.35);$('fitMapBtn').onclick=fitMap;

function updateDb(){
  const markers=fastAllMarkers(),layers=markers.reduce((a,m)=>(a[m.layer]=(a[m.layer]||0)+1,a),{});
  $('dbStatus').textContent=`${markers.length.toLocaleString('de-DE')} Marker · ${(layers.surface||0).toLocaleString('de-DE')} Oberfläche · ${(layers.sky||0).toLocaleString('de-DE')} Himmel · ${(layers.depths||0).toLocaleString('de-DE')} Untergrund`;
  $('footerMarkerCount').textContent=`${markers.length.toLocaleString('de-DE')} Marker`;
  $('footerLayer').textContent=layerTitles[currentLayer];
}
function layerTypeCounts(layer=currentLayer){
  const counts=new Map();
  fastAllMarkers().forEach(m=>{if(m.layer===layer)counts.set(m.type,(counts.get(m.type)||0)+1)});
  return counts;
}
const listIconMap={"shrine":"shrine.png","lightroot":"lightroot.png","korok":"korok_hidden_start.png","cave":"cave.png","bubbul":"bubbul.png","well":"well.png","chasm":"chasm.png","hinox":"hinox.png","talus":"talus.png","molduga":"molduga.png","flux_construct":"flux_construct.png","frox":"frox.png","gleeok":"gleeok.png","old_map":"old_map.png","sages_will":"sages_will.png","addison":"addison_sign.png","yiga_schematic":"yiga_schematic.png","schema_stone":"schema_stone.png","location":"location.png"};
function renderFilters(){
  filters.innerHTML='';
  const active=enabledTypes();
  const counts=layerTypeCounts();
  Object.entries(typeInfo).forEach(([k,v])=>{
    const count=counts.get(k)||0;
    if(!count)return;
    const l=document.createElement('label');
    l.className=`filter-chip ${active.has(k)?'':'off'}`;
    l.style.setProperty('--marker-color',v.color||'#8ab8aa');
    l.innerHTML=`<input type="checkbox" ${active.has(k)?'checked':''} data-type="${k}"><span class="filter-icon">${listIconMap[k]?`<img src="assets/icons/${listIconMap[k]}" alt="">`:v.icon}</span><span class="filter-copy"><b>${v.label}</b></span><small class="filter-count">${count.toLocaleString('de-DE')}</small>`;
    filters.appendChild(l);
  });
  filters.querySelectorAll('input').forEach(i=>i.onchange=e=>{
    const set=enabledTypes();
    e.target.checked?set.add(e.target.dataset.type):set.delete(e.target.dataset.type);
    saveFilterState();renderFilters();render();
  });
  const visibleTypes=[...filters.querySelectorAll('input')];
  $('toggleAllFilters').textContent=visibleTypes.length&&visibleTypes.every(i=>i.checked)?'Alle aus':'Alle an';
}
let _allMarkersCache=null;
function fastAllMarkers(){return _allMarkersCache||(_allMarkersCache=allMarkers())}
function invalidateMarkerCache(){_allMarkersCache=null}
function visible(){const q=searchInput.value.trim().toLowerCase(),active=enabledTypes();return fastAllMarkers().filter(m=>m.layer===currentLayer&&active.has(m.type)&&(!q||`${markerName(m)} ${m.name} ${m.name_en||''} ${m.type} ${m.note||''}`.toLowerCase().includes(q)))}

let placeLabelRAF=0;
function schedulePlaceLabels(){
  if(placeLabelRAF)return;
  placeLabelRAF=requestAnimationFrame(()=>{placeLabelRAF=0;renderPlaceLabels()});
}
function placePriority(name){
  const s=String(name||'').toLowerCase();
  if(/village|town|domain|landing|castle|forest|stable|city|stadt|dorf|spähposten|schloss|stall|reich/.test(s))return 0;
  if(/mount|mountain|lake|island|archipelago|bridge|ruins|temple|spring|canyon|plateau|sea|berg|see|insel|brücke|ruine|tempel|quelle|hochland/.test(s))return 1;
  return 2;
}
function renderPlaceLabels(){
  if(!placeLabelLayer)return;
  placeLabelLayer.innerHTML='';
  if(!showPlaceLabels.checked)return;
  const candidates=allMarkers().filter(m=>m.layer===currentLayer&&m.type==='location'&&m.name);
  const zoom=view.zoom;
  const maxPriority=zoom<1.35?0:zoom<2.05?1:2;
  const cellPx=zoom<1.35?135:zoom<2.05?100:zoom<3.2?78:58;
  const maxLabels=zoom<1.35?42:zoom<2.05?90:zoom<3.2?165:280;
  const occupied=new Set();
  const sorted=candidates.map(m=>({m,p:placePriority(markerName(m))})).filter(x=>x.p<=maxPriority).sort((a,b)=>a.p-b.p||String(markerName(a.m)).length-String(markerName(b.m)).length);
  let shown=0;
  for(const {m,p} of sorted){
    const pos=coordToPct(m.x,m.y);
    if(pos.left<0||pos.left>100||pos.top<0||pos.top>100)continue;
    const screenX=(pos.left/100*view.baseSize*zoom)+view.x;
    const screenY=(pos.top/100*view.baseSize*zoom)+view.y;
    const vr=mapViewport.getBoundingClientRect();
    if(screenX<-80||screenY<-30||screenX>vr.width+80||screenY>vr.height+30)continue;
    const key=Math.floor(screenX/cellPx)+':'+Math.floor(screenY/cellPx);
    if(occupied.has(key))continue;
    occupied.add(key);
    const el=document.createElement('button');
    el.type='button';el.className='place-label'+(p===0?' major':'');
    el.style.left=pos.left+'%';el.style.top=pos.top+'%';
    const labelName=markerName(m);el.textContent=labelName;el.title=labelName;el.setAttribute('aria-label','Ort: '+labelName);
    el.onclick=e=>{e.stopPropagation();selectedId=m.id;render();};
    placeLabelLayer.appendChild(el);
    if(++shown>=maxLabels)break;
  }
}

function renderMarkers(){
  markerLayer.innerHTML='';
  const markers=visible().slice(0,3500).filter(m=>{
    const p=coordToPct(m.x,m.y);
    return p.left>=-2&&p.left<=102&&p.top>=-2&&p.top<=102;
  });

  // Cluster in map-world coordinates. The cell size shrinks as we zoom in,
  // so groups naturally split into the original ROMFS marker icons.
  const clusterUntil=2.35;
  const shouldCluster=view.zoom<clusterUntil&&markers.length>=6;
  if(!shouldCluster){
    markers.forEach(m=>appendMarker(m));
    return;
  }

  const screenCellPx=view.zoom<1.25?54:view.zoom<1.75?48:42;
  const worldCell=screenCellPx/view.zoom;
  const groups=new Map();

  markers.forEach(m=>{
    const p=coordToPct(m.x,m.y);
    const wx=p.left/100*view.baseSize, wy=p.top/100*view.baseSize;
    const key=Math.floor(wx/worldCell)+':'+Math.floor(wy/worldCell);
    if(!groups.has(key))groups.set(key,[]);
    groups.get(key).push({m,p,wx,wy});
  });

  groups.forEach(group=>{
    if(group.length===1){appendMarker(group[0].m);return;}

    const avgLeft=group.reduce((s,o)=>s+o.p.left,0)/group.length;
    const avgTop=group.reduce((s,o)=>s+o.p.top,0)/group.length;
    const avgX=group.reduce((s,o)=>s+o.m.x,0)/group.length;
    const avgY=group.reduce((s,o)=>s+o.m.y,0)/group.length;
    const types=[...new Set(group.map(o=>o.m.type))];
    const info=types.length===1?(typeInfo[types[0]]||typeInfo.custom):null;
    const b=document.createElement('button');
    b.type='button';
    b.className='marker-cluster'+(types.length>1?' mixed':'');
    b.style.left=avgLeft+'%';b.style.top=avgTop+'%';
    if(info)b.style.setProperty('--cluster-color',info.color||'#71e0bd');
    b.innerHTML=`<span>${group.length}</span>`;
    b.title=types.length===1?`${group.length} × ${info?.label||types[0]}`:`${group.length} Marker`;
    b.setAttribute('aria-label',b.title+'. Hineinzoomen');
    b.onclick=e=>{
      e.stopPropagation();
      const target=Math.min(MAX_ZOOM,Math.max(clusterUntil+.25,view.zoom*1.75));
      panToCoordinate(avgX,avgY,target);
      renderMarkers();
      schedulePlaceLabels();
    };
    markerLayer.appendChild(b);
  });
}
function appendMarker(m){
  const p=coordToPct(m.x,m.y),info=typeInfo[m.type]||typeInfo.custom,b=document.createElement('button');
  b.className=`marker ${m.type} ${completed.has(m.id)?'completed':''} ${selectedId===m.id?'selected':''}`;
  b.style.left=p.left+'%';b.style.top=p.top+'%';b.style.setProperty('--marker-color',info.color||'#8ab8aa');
  const displayName=markerName(m);b.title=`${displayName} (${Math.round(m.x)}, ${Math.round(m.y)}, ${Math.round(m.z)})`;
  b.setAttribute('aria-label',displayName);b.innerHTML=`<span class="marker-glyph">${info.icon}</span>`;
  b.onclick=e=>{e.stopPropagation();selectedId=m.id;render();};markerLayer.appendChild(b);
}
function renderDetail(){
  const m=fastAllMarkers().find(x=>x.id===selectedId);
  if(!m||m.layer!==currentLayer){detailPanel.innerHTML='<div class="detail-empty"><div class="detail-icon">⌖</div><h3>Marker auswählen</h3><p>Tippe auf einen Marker für Details.</p></div>';return}
  const info=typeInfo[m.type]||typeInfo.custom;
  const done=completed.has(m.id);
  detailPanel.innerHTML=`<div class="detail-card detail-card-clean">
    <div class="detail-card-head">
      <div class="detail-big-icon"><span style="color:${info.color}">${info.icon}</span></div>
      <div class="detail-title-wrap"><span class="detail-kind">${esc(info.label)}</span><h3>${esc(markerName(m))}</h3></div>
      <button class="detail-close-icon" id="detailCloseBtn" aria-label="Schließen">×</button>
    </div>
    <div class="detail-status ${done?'is-done':''}">${done?'✓ Erledigt':'○ Noch offen'}</div>
    <div class="coords detail-coords">X ${Math.round(m.x)} · Y ${Math.round(m.y)} · Z ${Math.round(m.z)}</div>
    ${m.note?`<div class="detail-note-clean"><span>HINWEIS</span><p>${esc(m.note)}</p></div>`:''}
    <div class="detail-actions detail-actions-clean">
      <button class="ghost" id="focusMarkerBtn">◎ Fokussieren</button>
      <button class="primary" id="completeBtn">${done?'↺ Wieder öffnen':'✓ Erledigt'}</button>
    </div>
  </div>`;
  $('focusMarkerBtn').onclick=()=>panToCoordinate(m.x,m.y,Math.max(3,view.zoom));
  $('detailCloseBtn').onclick=()=>{selectedId=null;render()};
  $('completeBtn').onclick=()=>{completed.has(m.id)?completed.delete(m.id):completed.add(m.id);localStorage.setItem('totk.completed',JSON.stringify([...completed]));markStatsDirty();render()};
}
const progressIconMap={"shrine":"shrine.png","tower":null,"lightroot":"lightroot.png","korok":"korok_hidden_start.png","cave":"cave.png","bubbul":"bubbul.png","well":"well.png","chasm":"chasm.png","hinox":"hinox.png","talus":"talus.png","molduga":"molduga.png","flux_construct":"flux_construct.png","frox":"frox.png","gleeok":"gleeok.png","old_map":"old_map.png","sages_will":"sages_will.png","addison":"addison_sign.png","schema_stone":"schema_stone.png","yiga_schematic":"yiga_schematic.png"};
function renderProgress(){
  const w=$('progressList');w.innerHTML='';
  const tracked=['shrine','tower','lightroot','korok','cave','bubbul','well','chasm','hinox','talus','molduga','flux_construct','frox','gleeok','old_map','sages_will','addison','schema_stone','yiga_schematic'];
  let total=0,done=0;

  tracked.forEach(t=>{
    const a=fastAllMarkers().filter(m=>m.type===t);
    if(!a.length)return;

    const d=a.filter(m=>completed.has(m.id)).length;
    const pct=Math.round(d/a.length*100);
    total+=a.length;done+=d;

    const info=typeInfo[t];
    const icon=progressIconMap[t]
      ? `<img src="assets/icons/${progressIconMap[t]}" alt="">`
      : `<span class="progress-fallback-icon" style="color:${info.color}">${info.icon}</span>`;

    w.insertAdjacentHTML('beforeend',`
      <div class="progress-item">
        <div class="progress-item-main">
          <div class="progress-item-icon">${icon}</div>
          <div class="progress-item-copy">
            <div class="progress-item-head">
              <b>${info.label}</b>
              <span>${d.toLocaleString('de-DE')} / ${a.length.toLocaleString('de-DE')}</span>
            </div>
            <div class="progress-item-bar"><i style="width:${pct}%"></i></div>
          </div>
          <strong>${pct}%</strong>
        </div>
      </div>
    `);
  });

  const pct=total?Math.round(done/total*100):0;
  $('progressSummary').innerHTML=`
    <div class="progress-overview">
      <div class="progress-summary-copy">
        <b>${done.toLocaleString('de-DE')} erledigt</b>
        <small>von ${total.toLocaleString('de-DE')} trackbaren Markern</small>
        <strong class="progress-summary-percent">${pct}%</strong>
        <div class="progress-summary-bar"><i style="width:${pct}%"></i></div>
      </div>
    </div>
  `;
}
function updateLayerImage(){mapImage.src=mapSources[currentLayer];mapImage.alt=`TOTK ${layerTitles[currentLayer]} Karte`}
let _progressDirty=true,_dbDirty=true;
function markStatsDirty(){_progressDirty=true;_dbDirty=true}
function render(){
  $('activeLayerTitle').textContent=layerTitles[currentLayer];
  function preloadLayerMaps(){
  Object.values(mapSources).forEach(src=>{const img=new Image();img.decoding='async';img.src=src});
}
if('requestIdleCallback' in window)requestIdleCallback(preloadLayerMaps,{timeout:1800});
else setTimeout(preloadLayerMaps,700);
document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t.dataset.layer===currentLayer));
  renderMarkers();
  renderPlaceLabels();
  renderDetail();
  if(_progressDirty){renderProgress();_progressDirty=false}
  if(_dbDirty){updateDb();_dbDirty=false}
}

document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{currentLayer=t.dataset.layer;selectedId=null;updateLayerImage();fitMap();renderFilters();render()});
document.querySelectorAll('.sidebar-nav-btn').forEach(btn=>btn.onclick=()=>{document.querySelectorAll('.sidebar-nav-btn').forEach(b=>b.classList.toggle('active',b===btn));document.querySelectorAll('.side-panel').forEach(p=>p.classList.toggle('active',p.id===btn.dataset.panel));});
$('toggleAllFilters').onclick=()=>{const rendered=[...filters.querySelectorAll('input')],allOn=rendered.length&&rendered.every(i=>i.checked),set=enabledTypes();rendered.forEach(i=>{allOn?set.delete(i.dataset.type):set.add(i.dataset.type)});saveFilterState();renderFilters();render();};
const setSidebar=open=>document.body.classList.toggle('sidebar-open',open);
$('openSidebarBtn').onclick=()=>setSidebar(true);$('closeSidebarBtn').onclick=()=>setSidebar(false);$('sidebarBackdrop').onclick=()=>setSidebar(false);
let searchRenderTimer=0;
searchInput.oninput=()=>{clearTimeout(searchRenderTimer);searchRenderTimer=setTimeout(render,90)};hideCompleted.onchange=render;showPlaceLabels.onchange=()=>{localStorage.setItem(PLACE_LABEL_KEY,JSON.stringify(showPlaceLabels.checked));renderPlaceLabels()};
$('resetProgress').onclick=()=>{if(confirm('Fortschritt zurücksetzen?')){completed.clear();localStorage.removeItem('totk.completed');markStatsDirty();render()}};
$('dataImport').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const data=JSON.parse(await f.text());importedMarkers=flatten(data).map(normalizeOne).filter(m=>Number.isFinite(m.x)&&Number.isFinite(m.y)&&Number.isFinite(m.z));localStorage.setItem('totk.importedMarkers',JSON.stringify(importedMarkers));invalidateMarkerCache();markStatsDirty();selectedId=null;renderFilters();render();alert(`${importedMarkers.length} Marker importiert.`)}catch(err){alert('JSON konnte nicht importiert werden: '+err.message)}};
$('clearImported').onclick=()=>{importedMarkers=[];localStorage.removeItem('totk.importedMarkers');invalidateMarkerCache();markStatsDirty();renderFilters();render()};
$('findNearest').onclick=()=>{const x=Number($('coordX').value),y=Number($('coordY').value),z=Number($('coordZ').value);if([x,y,z].some(Number.isNaN))return;const pin=coordToPct(x,y),pl=$('playerPin');pl.style.left=pin.left+'%';pl.style.top=pin.top+'%';pl.classList.remove('hidden');panToCoordinate(x,y,Math.max(2.5,view.zoom));const n=allMarkers().filter(m=>m.layer===currentLayer&&!completed.has(m.id)&&enabledTypes().has(m.type)).map(m=>({...m,d:Math.hypot(m.x-x,m.y-y,m.z-z)})).sort((a,b)=>a.d-b.d).slice(0,5);$('nearestResults').innerHTML=n.map(m=>`<div class="nearest-item"><b>${esc(markerName(m))}</b><br>${typeInfo[m.type]?.label||m.type} · ${Math.round(m.d)} Einheiten</div>`).join('')};
$('centerBtn').onclick=()=>fitMap();
const dlg=$('markerDialog');$('addMarkerBtn').onclick=()=>dlg.showModal();$('saveCustom').onclick=e=>{e.preventDefault();const name=$('customName').value.trim(),x=Number($('customX').value),y=Number($('customY').value),z=Number($('customZ').value);if(!name||[x,y,z].some(Number.isNaN))return;const m={id:'u'+Date.now(),name,type:$('customType').value,layer:currentLayer,x,y,z,note:$('customNote').value.trim(),custom:true};customMarkers.push(m);localStorage.setItem('totk.customMarkers',JSON.stringify(customMarkers));selectedId=m.id;$('markerForm').reset();dlg.close();renderFilters();render();panToCoordinate(x,y,3)};

window.addEventListener('resize',()=>{clearTimeout(window.__totkResize);window.__totkResize=setTimeout(fitMap,120)});
renderFilters();render();requestAnimationFrame(fitMap);

updateLocaleStatus(); if($('syncLocale'))$('syncLocale').onclick=()=>syncGermanNames(true); if(navigator.onLine&&localizationStats().pct<95)syncGermanNames(false);
