
import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { REGION_GROUPS, MISTHALIN_AREAS } from '../constants';
import { Lock, Unlock, ZoomIn, ZoomOut, Move, Loader2, Download } from 'lucide-react';
import html2canvas from 'html2canvas';

const DIRECT_MAP_URL = 'https://cdn.runescape.com/assets/img/external/oldschool/world-map/2025-11-18/osrs_world_map.jpg';
// Using wsrv.nl as a reliable CORS proxy for the image. It caches and adds correct headers.
const PROXY_MAP_URL = `https://wsrv.nl/?url=${encodeURIComponent(DIRECT_MAP_URL)}&output=jpg`;

const MAP_CACHE_NAME = 'fate-locked-map-v1';

// Standardized Coordinates (0-100%)
const REGION_COORDS: Record<string, { x: number; y: number }> = {
  'Misthalin': { x: 73.41, y: 41.69 },
  'Asgarnia': { x: 65.97, y: 37.47 },
  'Kandarin': { x: 52.67, y: 39.47 },
  'Karamja': { x: 61.7, y: 53.5 },
  'Kharidian Desert': { x: 76.55, y: 59.68 },
  'Morytania': { x: 84.39, y: 36.65 },
  'Fremennik': { x: 55.96, y: 26.73 },
  'Tirannwn': { x: 41.69, y: 44.33 },
  'Wilderness': { x: 71.13, y: 20.58 },
  'Kourend & Kebos': { x: 20.77, y: 24.23 },
  'Varlamore': { x: 17.91, y: 47.45 },
  'Islands & Others': { x: 78, y: 25 },
  'The Open Seas': { x: 61.81, y: 74.35 }
};

const KARAMJA_POINTS = [
  {x:58.85,y:50.05},{x:58.41,y:50.29},{x:58.41,y:51.09},{x:58.45,y:51.65},{x:58.43,y:52.31},{x:58.35,y:52.90},{x:58.41,y:53.52},{x:58.45,y:53.82},
  {x:58.47,y:54.44},{x:58.35,y:55.78},{x:58.27,y:56.58},{x:58.31,y:57.76},{x:58.33,y:59.22},{x:58.35,y:60.31},{x:58.62,y:61.50},{x:59.26,y:61.92},
  {x:60.16,y:62.06},{x:61.24,y:62.06},{x:62.36,y:61.77},{x:63.50,y:61.83},{x:64.64,y:62.03},{x:65.27,y:61.83},{x:65.93,y:61.56},{x:66.04,y:60.61},
  {x:65.85,y:59.69},{x:65.25,y:59.13},{x:65.33,y:58.62},{x:65.54,y:58.33},{x:65.97,y:58.06},{x:66.04,y:57.26},{x:65.18,y:55.96},{x:65.75,y:55.81},
  {x:66.27,y:55.87},{x:66.66,y:55.36},{x:66.62,y:54.15},{x:66.47,y:52.87},{x:65.60,y:52.93},{x:64.89,y:53.17},{x:64.67,y:52.78},{x:64.60,y:52.13},
  {x:64.66,y:51.36},{x:63.98,y:50.85},{x:63.34,y:50.44},{x:62.79,y:50.41},{x:62.59,y:50.35},{x:62.84,y:50.05},{x:63.52,y:50.05},{x:64.04,y:50.17},
  {x:64.67,y:50.17},{x:65.00,y:50.02},{x:65.39,y:49.55},{x:65.27,y:48.99},{x:64.94,y:48.63},{x:64.73,y:48.42},{x:64.23,y:48.01},{x:63.92,y:47.59},
  {x:63.52,y:47.24},{x:63.07,y:47.03},{x:62.67,y:47.00},{x:62.15,y:46.91},{x:61.38,y:46.61},{x:60.65,y:46.35},{x:60.20,y:46.29},{x:59.53,y:46.14},
  {x:59.20,y:45.49},{x:59.01,y:45.13},{x:58.83,y:44.92},{x:58.37,y:44.74},{x:58.16,y:44.74},{x:57.85,y:44.80},{x:57.52,y:44.89},{x:57.08,y:45.19},
  {x:56.83,y:45.60},{x:56.77,y:45.81},{x:56.62,y:45.87},{x:56.37,y:45.87},{x:56.21,y:45.90},{x:56.04,y:46.32},{x:55.98,y:46.64},{x:55.98,y:46.85},
  {x:56.10,y:47.12},{x:56.31,y:47.38},{x:56.52,y:47.53},{x:56.79,y:47.74},{x:56.87,y:47.86},{x:56.69,y:48.21},{x:56.58,y:48.45},{x:56.54,y:48.81},
  {x:56.54,y:49.07},{x:56.62,y:49.43},{x:56.79,y:49.55},{x:57.12,y:49.82}
];

const MUSA_POINT_POINTS = [
  {x: 62.17038552093202, y: 49.79501435768427},
  {x: 62.141611359769065, y: 47.316009639344244},
  {x: 62.619262435074084, y: 47.94461440720904},
  {x: 63.016345859122836, y: 47.82066417129203},
  {x: 63.17748116163536, y: 47.66129958225589},
  {x: 63.154461832705, y: 47.28059528622509},
  {x: 63.534280760055985, y: 47.112377108909165},
  {x: 63.51126143112562, y: 47.75868905333353},
  {x: 63.70117089480111, y: 47.856078524411174},
  {x: 64.0004221708958, y: 47.7763962298931},
  {x: 64.25938962136239, y: 47.92690723064946},
  {x: 64.24212512466461, y: 48.28990435012068},
  {x: 64.4320345883401, y: 48.57321917507383},
  {x: 64.75430519336517, y: 48.80341247034826},
  {x: 64.97298881820362, y: 48.67060864615148},
  {x: 65.19167244304207, y: 48.91850911798548},
  {x: 65.36431741001977, y: 49.27265264917691},
  {x: 65.35856257778718, y: 49.67106412176727},
  {x: 64.99025331490138, y: 49.998646888119346},
  {x: 64.52411190406156, y: 50.149157888875706},
  {x: 64.12702848001281, y: 50.03406124123849},
  {x: 63.92560935187214, y: 50.122597124036346},
  {x: 63.71843539149887, y: 49.98093971155978}
];

const FALADOR_POINTS = [
  { x: 64.28211805277662, y: 38.427404691153065 },
  { x: 64.29097792481551, y: 41.548805700986776 },
  { x: 64.41591186523438, y: 41.60229022686298 },
  { x: 64.42387600539864, y: 41.82141714289365 },
  { x: 64.50028686523439, y: 42.0301748422476 },
  { x: 65.93005425200747, y: 42.121289728991215 },
  { x: 66.46164657434, y: 41.494283412605405 },
  { x: 66.92841186523437, y: 41.2801748422476 },
  { x: 67.15653686523437, y: 41.2801748422476 },
  { x: 67.22528686523438, y: 41.17440561147836 },
  { x: 68.38423880677597, y: 41.19441082650784 },
  { x: 68.39309867881485, y: 39.599633891352624 },
  { x: 68.63231522386448, y: 39.258869588969034 },
  { x: 68.6234553518256, y: 38.5637104121065 },
  { x: 68.34879931862046, y: 38.2502072539136 },
  { x: 67.1438567213334, y: 38.29109897019963 },
  { x: 67.0375382568669, y: 38.19568496553222 },
  { x: 66.58036919968542, y: 38.0401467344287 },
  { x: 66.23099006153129, y: 38.14646666767418 },
  { x: 66.0121481837864, y: 38.1405600047161 },
  { x: 65.92384356645073, y: 38.0401467344287 },
  { x: 64.52632701383419, y: 38.046053397386785 }
];

const APE_ATOLL_POINTS = [
  { x: 57.552083333333336, y: 64.79779411764706 },
  { x: 60.35729414566218, y: 64.70172336061599 },
  { x: 60.45621648148515, y: 66.02576082774932 },
  { x: 60.37707861282677, y: 68.55208519032556 },
  { x: 60.406755313573655, y: 69.26736979900679 },
  { x: 60.50567764939664, y: 70.15006144376234 },
  { x: 60.317725211332984, y: 70.71315783783054 },
  { x: 59.244791666666664, y: 70.77205882352942 },
  { x: 57.682291666666664, y: 70.86397058823529 },
  { x: 56.184895833333336, y: 70.03676470588235 },
  { x: 56.0546875, y: 67.64705882352942 },
  { x: 56.510416666666664, y: 65.53308823529412 }
];

const ISLE_OF_SOULS_POINTS = [
  { x: 38.15, y: 57.22 }, { x: 38.15, y: 56.86 }, { x: 37.88, y: 56.87 }, { x: 37.87, y: 56.53 }, { x: 37.88, y: 56.07 },
  { x: 38.20, y: 55.91 }, { x: 38.62, y: 56.01 }, { x: 38.79, y: 56.08 }, { x: 38.82, y: 56.36 }, { x: 38.38, y: 56.92 },
  { x: 38.50, y: 57.06 }, { x: 38.65, y: 57.00 }, { x: 38.80, y: 56.75 }, { x: 38.94, y: 56.75 }, { x: 39.12, y: 56.78 },
  { x: 39.32, y: 56.77 }, { x: 39.64, y: 56.56 }, { x: 39.73, y: 56.41 }, { x: 39.91, y: 56.05 }, { x: 40.74, y: 55.99 },
  { x: 41.22, y: 56.69 }, { x: 41.92, y: 57.03 }, { x: 42.54, y: 56.84 }, { x: 42.89, y: 57.25 }, { x: 43.38, y: 57.39 },
  { x: 44.02, y: 57.72 }, { x: 44.45, y: 57.91 }, { x: 44.49, y: 58.48 }, { x: 44.88, y: 59.19 }, { x: 45.12, y: 60.30 },
  { x: 44.84, y: 61.06 }, { x: 44.64, y: 62.47 }, { x: 43.87, y: 62.74 }, { x: 43.42, y: 63.10 }, { x: 43.17, y: 63.49 },
  { x: 43.16, y: 64.29 }, { x: 43.23, y: 64.76 }, { x: 43.29, y: 65.04 }, { x: 43.71, y: 66.03 }, { x: 43.58, y: 66.38 },
  { x: 43.21, y: 66.35 }, { x: 42.53, y: 65.95 }, { x: 42.01, y: 66.32 }, { x: 41.48, y: 66.98 }, { x: 40.76, y: 67.01 },
  { x: 39.82, y: 66.82 }, { x: 39.06, y: 66.26 }, { x: 38.50, y: 65.58 }, { x: 38.28, y: 64.89 }, { x: 38.57, y: 64.63 },
  { x: 38.27, y: 64.31 }, { x: 38.12, y: 63.98 }, { x: 37.81, y: 64.00 }, { x: 37.54, y: 63.75 }, { x: 37.30, y: 63.31 },
  { x: 37.08, y: 63.17 }, { x: 36.73, y: 62.86 }, { x: 36.51, y: 62.60 }, { x: 36.55, y: 62.39 }, { x: 36.67, y: 62.02 },
  { x: 36.71, y: 61.50 }, { x: 36.59, y: 61.14 }, { x: 36.77, y: 60.38 }, { x: 36.95, y: 59.88 }, { x: 36.78, y: 59.10 },
  { x: 36.95, y: 58.81 }, { x: 36.86, y: 58.29 }, { x: 37.10, y: 57.89 }, { x: 37.25, y: 57.85 }, { x: 37.52, y: 57.55 }
];

const MISTHALIN_POINTS = [
  { x: 68.65714111328126, y: 42.67139610877404 },
  { x: 68.62276611328126, y: 42.61370380108173 },
  { x: 68.62276611328126, y: 42.07524226262019 },
  { x: 68.70089111328124, y: 41.96947303185096 },
  { x: 68.67276611328124, y: 41.81081918569712 },
  { x: 68.65714111328126, y: 41.777165339543274 },
  { x: 68.66651611328125, y: 41.40216533954327 },
  { x: 68.69464111328125, y: 41.30120380108173 },
  { x: 68.68526611328124, y: 41.18581918569711 },
  { x: 68.70178347646431, y: 36.68774713833959 },
  { x: 68.58535474585584, y: 35.694439055403194 },
  { x: 68.34384601625271, y: 34.89639218840516 },
  { x: 68.4785740292629, y: 34.3402915361619 },
  { x: 68.46542983287168, y: 32.272608201911936 },
  { x: 77.49473436959109, y: 32.260485378231024 },
  { x: 77.62545511915062, y: 31.657158874489422 },
  { x: 77.8688661700546, y: 31.643289299690764 },
  { x: 78.16636856560389, y: 31.740376323281367 },
  { x: 78.57205365044383, y: 32.00389824445586 },
  { x: 79.47808367325307, y: 32.03857218145251 },
  { x: 80.18421020507812, y: 33.91092153695913 },
  { x: 80.34671020507812, y: 34.31476769080529 },
  { x: 80.38108520507812, y: 34.52149846003606 },
  { x: 80.21858520507813, y: 34.6849599984976 },
  { x: 80.04671020507811, y: 34.90130615234375 },
  { x: 79.80296020507812, y: 35.09361384465144 },
  { x: 79.76233520507813, y: 35.29072922926682 },
  { x: 79.61233520507812, y: 35.47822922926683 },
  { x: 79.40296020507812, y: 35.78111384465144 },
  { x: 79.39671020507812, y: 36.01669076772836 },
  { x: 79.45921020507812, y: 36.28592153695914 },
  { x: 79.36233520507812, y: 36.48784461388221 },
  { x: 79.35608520507812, y: 36.76188307542067 },
  { x: 79.48733520507812, y: 37.07919076772836 },
  { x: 79.34272162487875, y: 37.63045915247387 },
  { x: 79.37983104446457, y: 37.988067148344626 },
  { x: 79.26156981586038, y: 38.452328758193325 },
  { x: 78.98834559805073, y: 38.75974522957962 },
  { x: 78.70696543344079, y: 39.19263781173584 },
  { x: 78.81707071524467, y: 39.50005428312214 },
  { x: 78.82930463544511, y: 39.85138739327791 },
  { x: 78.63356191223819, y: 40.246637142203156 },
  { x: 78.69678344726563, y: 40.63080538236178 },
  { x: 79.0413560619756, y: 41.07074553419074 },
  { x: 75.22490844726562, y: 41.092343843900245 },
  { x: 75.19990844726563, y: 41.28465153620793 },
  { x: 75.07803344726562, y: 41.46253615159255 },
  { x: 75.08428344726562, y: 46.924072265625 },
  { x: 74.98115844726563, y: 47.05387995793269 },
  { x: 74.80615844726563, y: 47.04426457331731 },
  { x: 74.70928344726563, y: 47.59234149639423 },
  { x: 74.52490844726563, y: 47.97214918870193 },
  { x: 74.47803344726563, y: 48.58753380408654 },
  { x: 74.49053344726563, y: 49.36637995793269 },
  { x: 74.25318748685017, y: 49.43848468617134 },
  { x: 74.31030150014145, y: 49.92175711784743 },
  { x: 73.99617442703942, y: 49.85829710156673 },
  { x: 73.85338939381121, y: 49.887586339850124 },
  { x: 73.72329636353663, y: 49.78995554557213 },
  { x: 73.4059962896962, y: 49.91199403841963 },
  { x: 72.91735417598193, y: 50.019387912125424 },
  { x: 72.6730331191248, y: 49.90223095899182 },
  { x: 72.43823106448288, y: 49.97545405470032 },
  { x: 72.19073700688733, y: 49.82900786328332 },
  { x: 72.03525997070552, y: 49.82412632356943 },
  { x: 71.8734369330469, y: 49.62886473501344 },
  { x: 71.70209489317307, y: 49.61910165558564 },
  { x: 71.5910398673289, y: 49.726495529291434 },
  { x: 71.44825483410071, y: 49.726495529291434 },
  { x: 71.26422079127326, y: 49.92175711784743 },
  { x: 71.13412776099868, y: 49.98033559441422 },
  { x: 70.97865072481686, y: 49.90711249870572 },
  { x: 70.89615270561835, y: 49.819244783855524 },
  { x: 70.8644226982343, y: 49.497063162738144 },
  { x: 70.94692071743282, y: 49.43360314645744 },
  { x: 70.8675956989727, y: 49.355498511035044 },
  { x: 70.88346070266473, y: 49.21881539904585 },
  { x: 71.02307273515453, y: 49.08701382677055 },
  { x: 70.99134272777047, y: 48.701372189372464 },
  { x: 70.91201770931038, y: 48.33037517111608 },
  { x: 70.92470971226399, y: 48.10094280456279 },
  { x: 70.83586569158867, y: 47.75435348487591 },
  { x: 70.84221169306547, y: 47.549328816892114 },
  { x: 70.80096268346622, y: 47.27108105319982 },
  { x: 70.7787516782974, y: 47.01235944836313 },
  { x: 70.59789063620833, y: 46.84150555837663 },
  { x: 70.20818481445312, y: 46.8155752328726 },
  { x: 70.21755981445312, y: 48.23384446364183 },
  { x: 70.37068481445313, y: 48.25788292518029 },
  { x: 70.43943481445312, y: 48.50788292518029 },
  { x: 70.42693481445312, y: 48.6905752328726 },
  { x: 70.50818481445312, y: 48.95499830979567 },
  { x: 70.39255981445312, y: 49.14249830979568 },
  { x: 70.16755981445313, y: 49.3780752328726 },
  { x: 70.04255981445311, y: 49.61845984825721 },
  { x: 69.90193481445313, y: 49.65692138671875 },
  { x: 69.76443481445312, y: 49.60403677133414 },
  { x: 69.64255981445312, y: 49.33961369441106 },
  { x: 69.59464111328126, y: 49.13774226262019 },
  { x: 69.41443481445313, y: 48.73384446364183 },
  { x: 69.51755981445312, y: 48.3732675405649 },
  { x: 69.68943481445312, y: 48.21461369441106 },
  { x: 69.79776611328124, y: 48.09447303185096 },
  { x: 70.02589111328125, y: 48.238703801081726 },
  { x: 70.01443481445312, y: 46.8107675405649 },
  { x: 69.83526611328125, y: 46.700242262620186 },
  { x: 69.61651611328125, y: 46.68581918569711 },
  { x: 69.35401611328125, y: 46.464665339543274 },
  { x: 69.16651611328125, y: 46.113703801081726 },
  { x: 69.21964111328126, y: 45.88774226262019 },
  { x: 69.15401611328124, y: 45.59928072415865 },
  { x: 69.05089111328125, y: 45.41178072415865 },
  { x: 68.66964111328126, y: 45.0704345703125 },
  { x: 68.54151611328125, y: 44.78678072415865 },
  { x: 68.54151611328125, y: 44.59447303185096 },
  { x: 68.65089111328125, y: 44.42139610877403 },
  { x: 68.62901611328125, y: 44.0079345703125 },
  { x: 68.66339111328125, y: 43.77716533954327 },
  { x: 68.70714111328124, y: 43.60889610877404 },
  { x: 68.66026611328125, y: 43.13774226262019 }
];

const BRIMHAVEN_POINTS = [
  { x: 58.32766723632813, y: 44.82037823016827 },
  { x: 58.037042236328126, y: 44.87326284555289 },
  { x: 57.84954223632812, y: 45.04633976862981 },
  { x: 57.671417236328125, y: 45.13768592247596 },
  { x: 57.69329223632812, y: 45.47422438401442 },
  { x: 57.51829223632813, y: 45.65210899939904 },
  { x: 57.39954223632813, y: 45.594416691706726 },
  { x: 57.305792236328124, y: 45.79633976862981 },
  { x: 57.09641723632812, y: 46.1136474609375 },
  { x: 56.952667236328125, y: 46.23383976862981 },
  { x: 56.91204223632812, y: 46.37326284555289 },
  { x: 56.86738023378558, y: 46.535815150733725 },
  { x: 56.91204223632812, y: 46.70018592247596 },
  { x: 56.943292236328126, y: 46.74345515324519 },
  { x: 56.915167236328124, y: 46.906916691706726 },
  { x: 56.85579223632813, y: 46.89730130709135 },
  { x: 56.81516723632812, y: 46.63768592247596 },
  { x: 56.66516723632813, y: 46.40210899939904 },
  { x: 56.53391723632812, y: 46.17133976862981 },
  { x: 56.437042236328125, y: 46.15210899939904 },
  { x: 56.39329223632813, y: 46.10883976862981 },
  { x: 56.296417236328125, y: 46.12326284555289 },
  { x: 56.28704223632812, y: 46.44057053786057 },
  { x: 56.34016723632812, y: 46.63287823016827 },
  { x: 56.296417236328125, y: 46.9261474609375 },
  { x: 56.45891723632812, y: 47.0511474609375 },
  { x: 56.89329223632813, y: 46.94537823016827 },
  { x: 56.771417236328126, y: 47.12807053786058 },
  { x: 56.790167236328124, y: 47.44057053786058 },
  { x: 57.09016723632813, y: 47.57518592247596 },
  { x: 57.24641723632813, y: 47.68576284555289 },
  { x: 57.27454223632813, y: 47.96460899939904 },
  { x: 57.071417236328124, y: 48.42133976862981 },
  { x: 56.83079223632812, y: 48.79153207632211 },
  { x: 56.73704223632813, y: 49.12807053786057 },
  { x: 56.86204223632812, y: 49.42133976862981 },
  { x: 57.09016723632813, y: 49.53672438401443 },
  { x: 57.33704223632813, y: 49.48383976862981 },
  { x: 57.44641723632813, y: 49.62807053786057 },
  { x: 57.515167236328125, y: 49.92133976862981 },
  { x: 57.843292236328125, y: 50.01749361478366 },
  { x: 58.32454223632813, y: 49.87326284555289 },
  { x: 58.45891723632812, y: 49.6761474609375 },
  { x: 58.57454223632812, y: 49.68576284555289 },
  { x: 58.696417236328124, y: 49.796339768629814 },
  { x: 58.98704223632812, y: 49.531916691706726 },
  { x: 58.82766723632813, y: 48.8011474609375 },
  { x: 58.812042236328125, y: 48.52710899939904 },
  { x: 59.023859908192286, y: 48.403890538304616 },
  { x: 59.212042236328124, y: 48.55595515324519 },
  { x: 59.38704223632813, y: 48.79153207632211 },
  { x: 59.36819023870985, y: 48.93362950188348 },
  { x: 59.4816167005274, y: 49.207847318324305 },
  { x: 59.684163953773016, y: 49.457136242361415 },
  { x: 59.8745583718239, y: 49.59424515058183 },
  { x: 60.22699059247129, y: 49.41974290375585 },
  { x: 60.413334065457256, y: 49.27640177243451 },
  { x: 60.400299115505405, y: 47.838002697111804 },
  { x: 60.400299115505405, y: 47.107947550052984 },
  { x: 60.29549560546875, y: 46.86937537560097 },
  { x: 60.07674560546875, y: 46.68187537560096 },
  { x: 60.02362060546875, y: 46.53764460637019 },
  { x: 59.89862060546876, y: 46.52802922175481 },
  { x: 59.74862060546875, y: 46.39822152944711 },
  { x: 59.55174560546875, y: 46.32610614483173 },
  { x: 59.36737060546875, y: 46.076106144831726 },
  { x: 59.17674560546875, y: 46.08091383713943 },
  { x: 59.17362060546875, y: 45.93668306790865 },
  { x: 59.05799560546875, y: 45.94629845252404 },
  { x: 59.05487060546874, y: 45.54245229867788 },
  { x: 58.88612060546875, y: 45.58572152944711 },
  { x: 58.82674560546876, y: 45.87899076021635 },
  { x: 58.69549560546875, y: 46.14822152944711 },
  { x: 58.55174560546875, y: 46.4703369140625 },
  { x: 58.40174560546875, y: 46.80206768329327 },
  { x: 58.249627685546876, y: 46.61012150691106 },
  { x: 58.11737060546876, y: 46.56168306790865 },
  { x: 58.02775268554687, y: 46.5235830453726 },
  { x: 57.84696655273438, y: 46.7614511343149 },
  { x: 57.72900574818887, y: 46.641333780207475 },
  { x: 57.54384155273438, y: 46.68452805739183 },
  { x: 57.50946655273438, y: 46.50664344200721 },
  { x: 57.61259155273437, y: 46.34798959585337 },
  { x: 58.103216552734374, y: 46.213374211237976 },
  { x: 58.15946655273437, y: 45.87202805739183 },
  { x: 58.280792236328125, y: 45.37807053786057 },
  { x: 58.29329223632812, y: 45.18576284555289 }
];

const FOSSIL_ISLAND_POINTS = [
  { x: 86.94, y: 21.08 }, { x: 87.05, y: 19.35 }, { x: 87.70, y: 18.73 }, { x: 88.03, y: 18.03 }, { x: 87.63, y: 17.19 },
  { x: 87.40, y: 16.13 }, { x: 87.67, y: 15.25 }, { x: 88.70, y: 14.66 }, { x: 89.88, y: 14.65 }, { x: 90.53, y: 15.17 },
  { x: 90.66, y: 15.06 }, { x: 90.82, y: 15.01 }, { x: 91.17, y: 14.85 }, { x: 91.55, y: 14.91 }, { x: 92.28, y: 15.52 },
  { x: 92.47, y: 15.88 }, { x: 92.40, y: 16.45 }, { x: 91.91, y: 17.11 }, { x: 92.02, y: 17.46 }, { x: 92.67, y: 17.42 },
  { x: 93.13, y: 17.58 }, { x: 93.59, y: 17.83 }, { x: 93.67, y: 18.25 }, { x: 93.99, y: 20.02 }, { x: 93.83, y: 21.46 },
  { x: 93.48, y: 21.98 }, { x: 92.75, y: 22.41 }, { x: 92.15, y: 23.06 }, { x: 91.19, y: 23.52 }, { x: 90.55, y: 23.55 },
  { x: 90.14, y: 23.18 }, { x: 89.97, y: 22.58 }, { x: 89.89, y: 22.66 }, { x: 89.64, y: 22.66 }, { x: 89.55, y: 23.71 },
  { x: 89.00, y: 24.29 }, { x: 88.42, y: 24.32 }, { x: 87.65, y: 23.54 }
];

const KARAMJA_VOLCANO_POINTS = [
  { x: 60.70285820563615, y: 49.75163996595587 },
  { x: 60.55641749541978, y: 49.66270836107621 },
  { x: 60.41768419100427, y: 49.271409299605715 },
  { x: 60.40997678520341, y: 47.05997672493154 },
  { x: 60.587247118623225, y: 47.05404795127289 },
  { x: 60.91866556806027, y: 46.787253136633915 },
  { x: 61.23081550299516, y: 46.633105021509174 },
  { x: 61.789602423557625, y: 47.0006889883451 },
  { x: 62.132581981695964, y: 47.29119889761865 },
  { x: 62.167265307799845, y: 49.77535506059045 },
  { x: 62.043946814986064, y: 49.60342062448977 },
  { x: 61.35028029290852, y: 49.96507581766705 },
  { x: 60.79534707524649, y: 49.64492204010028 }
];

const LUNAR_ISLE_POINTS = [
  { x: 36.11, y: 12.48 },
  { x: 35.99, y: 12.85 },
  { x: 35.79, y: 13.20 },
  { x: 35.68, y: 13.66 },
  { x: 35.56, y: 14.37 },
  { x: 35.56, y: 15.20 },
  { x: 35.68, y: 16.02 },
  { x: 35.86, y: 16.79 },
  { x: 36.15, y: 17.46 },
  { x: 36.47, y: 17.67 },
  { x: 36.85, y: 17.48 },
  { x: 37.20, y: 17.58 },
  { x: 37.64, y: 17.68 },
  { x: 38.03, y: 17.63 },
  { x: 38.40, y: 17.48 },
  { x: 38.77, y: 17.72 },
  { x: 39.16, y: 17.78 },
  { x: 39.43, y: 17.57 },
  { x: 39.49, y: 17.05 },
  { x: 39.47, y: 16.37 },
  { x: 39.35, y: 15.74 },
  { x: 39.13, y: 15.10 },
  { x: 38.91, y: 14.31 },
  { x: 39.54, y: 13.53 },
  { x: 39.45, y: 12.68 },
  { x: 38.94, y: 12.20 },
  { x: 37.97, y: 12.01 },
  { x: 37.47, y: 11.89 },
  { x: 36.98, y: 12.09 },
  { x: 36.49, y: 12.23 }
];

const SHILO_VILLAGE_POINTS = [
  { x: 60.43, y: 56.17 },
  { x: 60.54, y: 56.02 },
  { x: 60.62, y: 55.92 },
  { x: 62.48, y: 55.92 },
  { x: 62.48, y: 58.67 },
  { x: 62.41, y: 58.75 },
  { x: 62.36, y: 58.82 },
  { x: 60.43, y: 58.82 }
];

const TAI_BWO_WANNAI_POINTS = [
  { x: 58.66, y: 50.71 }, { x: 58.67, y: 50.42 }, { x: 58.88, y: 50.43 }, { x: 60.39, y: 51.01 }, 
  { x: 60.45, y: 52.00 }, { x: 60.45, y: 52.15 }, { x: 60.48, y: 52.10 }, { x: 60.49, y: 52.08 }, 
  { x: 60.81, y: 52.08 }, { x: 60.84, y: 52.12 }, { x: 60.85, y: 52.15 }, { x: 60.85, y: 52.71 }, 
  { x: 60.83, y: 52.73 }, { x: 60.81, y: 52.76 }, { x: 60.49, y: 52.76 }, { x: 60.47, y: 52.73 }, 
  { x: 60.46, y: 52.71 }, { x: 60.46, y: 52.86 }, { x: 60.46, y: 53.30 }, { x: 60.21, y: 53.81 }, 
  { x: 59.70, y: 53.88 }, { x: 59.82, y: 54.25 }, { x: 59.82, y: 54.48 }, { x: 59.77, y: 54.65 }, 
  { x: 59.59, y: 54.82 }, { x: 59.33, y: 54.67 }, { x: 59.29, y: 54.57 }, { x: 59.29, y: 54.39 }, 
  { x: 59.41, y: 54.15 }, { x: 59.49, y: 53.89 }, { x: 59.16, y: 53.79 }, { x: 58.98, y: 53.43 }, 
  { x: 58.88, y: 51.89 }
];

const KHARAZI_JUNGLE_POINTS = [
  { x: 58.77, y: 60.94 }, { x: 58.67, y: 60.65 }, { x: 58.71, y: 60.43 }, { x: 58.54, y: 60.33 },
  { x: 58.44, y: 60.11 }, { x: 58.55, y: 59.83 }, { x: 58.61, y: 59.56 }, { x: 58.50, y: 59.28 },
  { x: 58.48, y: 58.97 }, { x: 65.11, y: 58.96 }, { x: 65.10, y: 59.10 }, { x: 65.04, y: 59.24 },
  { x: 65.17, y: 59.34 }, { x: 65.27, y: 59.54 }, { x: 65.42, y: 59.35 }, { x: 65.61, y: 59.54 },
  { x: 65.63, y: 59.75 }, { x: 65.78, y: 59.98 }, { x: 65.87, y: 60.37 }, { x: 65.76, y: 60.75 },
  { x: 65.58, y: 60.94 }, { x: 65.59, y: 61.09 }, { x: 65.68, y: 61.28 }, { x: 65.60, y: 61.42 },
  { x: 65.24, y: 61.44 }, { x: 64.97, y: 61.52 }, { x: 64.69, y: 61.79 }, { x: 64.42, y: 61.82 },
  { x: 64.23, y: 61.64 }, { x: 64.09, y: 61.48 }, { x: 63.86, y: 61.66 }, { x: 63.63, y: 61.66 },
  { x: 63.46, y: 61.65 }, { x: 63.16, y: 61.67 }, { x: 62.80, y: 61.49 }, { x: 62.45, y: 61.25 },
  { x: 62.27, y: 61.12 }, { x: 62.07, y: 61.04 }, { x: 62.04, y: 61.26 }, { x: 61.92, y: 61.47 },
  { x: 61.75, y: 61.50 }, { x: 61.23, y: 61.48 }, { x: 60.86, y: 61.64 }, { x: 60.40, y: 61.76 },
  { x: 59.96, y: 61.26 }, { x: 59.68, y: 61.35 }, { x: 59.49, y: 61.10 }, { x: 59.37, y: 61.16 },
  { x: 59.38, y: 61.35 }, { x: 59.21, y: 61.52 }, { x: 58.83, y: 61.51 }, { x: 58.78, y: 61.29 },
  { x: 59.00, y: 61.01 }
];

const CRANDOR_POINTS = [
  { x: 60.37, y: 44.95 }, { x: 60.41, y: 44.37 }, { x: 60.28, y: 44.01 }, { x: 60.30, y: 43.06 },
  { x: 60.40, y: 42.54 }, { x: 60.92, y: 42.08 }, { x: 61.57, y: 41.88 }, { x: 61.91, y: 42.30 },
  { x: 62.05, y: 42.86 }, { x: 62.04, y: 43.23 }, { x: 61.93, y: 43.49 }, { x: 62.06, y: 44.45 },
  { x: 61.94, y: 45.03 }, { x: 61.75, y: 45.41 }, { x: 61.55, y: 45.50 }, { x: 61.02, y: 45.97 },
  { x: 60.55, y: 45.82 }
];

const PORT_SARIM_POINTS = [
  { x: 66.66, y: 43.88 }, { x: 68.50, y: 43.88 }, { x: 68.61, y: 43.96 }, { x: 68.62, y: 44.43 },
  { x: 68.52, y: 44.58 }, { x: 68.52, y: 44.80 }, { x: 68.32, y: 45.53 }, { x: 68.33, y: 47.57 },
  { x: 67.11, y: 48.10 }, { x: 66.66, y: 48.09 }
];

const RIMMINGTON_POINTS = [
  { x: 63.83, y: 46.63 }, { x: 63.88, y: 46.45 }, { x: 63.91, y: 46.18 }, { x: 63.85, y: 46.05 },
  { x: 63.57, y: 46.11 }, { x: 63.30, y: 46.01 }, { x: 63.21, y: 45.91 }, { x: 63.22, y: 45.74 },
  { x: 63.59, y: 45.54 }, { x: 63.69, y: 45.11 }, { x: 63.59, y: 44.85 }, { x: 63.69, y: 44.38 },
  { x: 63.86, y: 44.18 }, { x: 65.02, y: 44.14 }, { x: 66.13, y: 44.18 }, { x: 66.13, y: 47.05 },
  { x: 65.15, y: 47.05 }, { x: 64.15, y: 47.01 }, { x: 63.93, y: 46.85 }
];

const CRAFTING_GUILD_POINTS = [
  { x: 63.86, y: 43.48 }, { x: 63.84, y: 43.35 }, { x: 63.68, y: 43.06 }, { x: 63.60, y: 43.04 },
  { x: 63.56, y: 42.97 }, { x: 63.55, y: 42.87 }, { x: 63.61, y: 42.89 }, { x: 63.67, y: 42.79 },
  { x: 64.58, y: 42.79 }, { x: 64.58, y: 43.59 }, { x: 64.39, y: 43.59 }, { x: 64.39, y: 43.73 },
  { x: 64.37, y: 43.77 }, { x: 64.33, y: 43.87 }, { x: 64.27, y: 43.92 }, { x: 64.23, y: 43.98 },
  { x: 64.04, y: 43.98 }, { x: 64.01, y: 43.94 }, { x: 63.93, y: 43.87 }, { x: 63.88, y: 43.82 },
  { x: 63.88, y: 43.73 }, { x: 63.88, y: 43.59 }, { x: 63.86, y: 43.51 }
];

// Inner memoized component for heavy rendering
const MapContent = React.memo(({ regionUnlocks }: { regionUnlocks: string[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapContentRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ x: -1800, y: -1200, scale: 1 });
  const [mapSrc, setMapSrc] = useState<string>(DIRECT_MAP_URL);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let mounted = true;

    const cacheMap = async () => {
        if ('caches' in window) {
            try {
                const cache = await caches.open(MAP_CACHE_NAME);
                let cachedResponse = await cache.match(DIRECT_MAP_URL);
                if (!cachedResponse) {
                    cachedResponse = await cache.match(PROXY_MAP_URL);
                }

                if (cachedResponse) {
                    const blob = await cachedResponse.blob();
                    if (mounted) {
                        setMapSrc(URL.createObjectURL(blob));
                        setIsLoading(false);
                        return;
                    }
                }
            } catch (e) {
                console.warn("Cache access error", e);
            }
        }

        try {
            const response = await fetch(PROXY_MAP_URL);
            if (response.ok) {
                if ('caches' in window) {
                    const cache = await caches.open(MAP_CACHE_NAME);
                    cache.put(PROXY_MAP_URL, response.clone());
                }
                const blob = await response.blob();
                if (mounted) {
                    setMapSrc(URL.createObjectURL(blob));
                    setIsLoading(false);
                }
            } else {
                throw new Error("Proxy fetch failed");
            }
        } catch (err) {
            console.warn("Proxy map fetch failed, trying direct...", err);
            if (mounted) {
                setMapSrc(DIRECT_MAP_URL); 
                setIsLoading(false);
            }
        }
    };

    cacheMap();

    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomIntensity = 0.001;
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      setTransform(prev => {
        const delta = -e.deltaY;
        const factor = Math.exp(delta * zoomIntensity);
        const newScale = Math.min(Math.max(0.3, prev.scale * factor), 5);
        
        const newX = mouseX - (mouseX - prev.x) * (newScale / prev.scale);
        const newY = mouseY - (mouseY - prev.y) * (newScale / prev.scale);
        
        return { x: newX, y: newY, scale: newScale };
      });
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
  };

  const onMouseUp = () => {
    isDragging.current = false;
  };

  const handleExport = async () => {
    if (!mapContentRef.current) return;
    setIsExporting(true);
    
    try {
        const canvas = await html2canvas(mapContentRef.current, {
            useCORS: true,
            allowTaint: true,
            width: 4000, 
            height: 2600,
            scale: 1, 
            logging: false,
            backgroundColor: '#0b0d10',
            onclone: (doc) => {
                const el = doc.getElementById('map-content-inner');
                if (el) {
                    el.style.transform = 'none'; 
                    el.style.top = '0';
                    el.style.left = '0';
                }
            }
        });
        
        const link = document.createElement('a');
        link.download = `fate-locked-map-${Date.now()}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.8);
        link.click();
    } catch (err) {
        console.error("Map export failed:", err);
        alert("Failed to export map image.");
    } finally {
        setIsExporting(false);
    }
  };

  const karamjaPointsString = KARAMJA_POINTS.map(p => `${p.x},${p.y}`).join(' ');
  const musaPointPointsString = MUSA_POINT_POINTS.map(p => `${p.x},${p.y}`).join(' ');
  const faladorPointsString = FALADOR_POINTS.map(p => `${p.x},${p.y}`).join(' ');
  const apeAtollPointsString = APE_ATOLL_POINTS.map(p => `${p.x},${p.y}`).join(' ');
  const isleOfSoulsPointsString = ISLE_OF_SOULS_POINTS.map(p => `${p.x},${p.y}`).join(' ');
  const misthalinPointsString = MISTHALIN_POINTS.map(p => `${p.x},${p.y}`).join(' ');
  const brimhavenPointsString = BRIMHAVEN_POINTS.map(p => `${p.x},${p.y}`).join(' ');
  const fossilIslandPointsString = FOSSIL_ISLAND_POINTS.map(p => `${p.x},${p.y}`).join(' ');
  const volcanoPointsString = KARAMJA_VOLCANO_POINTS.map(p => `${p.x},${p.y}`).join(' ');
  const lunarIslePointsString = LUNAR_ISLE_POINTS.map(p => `${p.x},${p.y}`).join(' ');
  const shiloVillagePointsString = SHILO_VILLAGE_POINTS.map(p => `${p.x},${p.y}`).join(' ');
  const taiBwoWannaiPointsString = TAI_BWO_WANNAI_POINTS.map(p => `${p.x},${p.y}`).join(' ');
  const kharaziJunglePointsString = KHARAZI_JUNGLE_POINTS.map(p => `${p.x},${p.y}`).join(' ');
  const crandorPointsString = CRANDOR_POINTS.map(p => `${p.x},${p.y}`).join(' ');
  const portSarimPointsString = PORT_SARIM_POINTS.map(p => `${p.x},${p.y}`).join(' ');
  const rimmingtonPointsString = RIMMINGTON_POINTS.map(p => `${p.x},${p.y}`).join(' ');
  const craftingGuildPointsString = CRAFTING_GUILD_POINTS.map(p => `${p.x},${p.y}`).join(' ');

  const checkIsleOfSouls = regionUnlocks.includes('Isle of Souls (Expanded)');
  const checkFossilIsland = regionUnlocks.includes('Fossil Island');
  const checkLunarIsle = regionUnlocks.includes('Lunar Isle');
  const checkShiloVillage = regionUnlocks.includes('Shilo Village');
  const checkTaiBwoWannai = regionUnlocks.includes('Tai Bwo Wannai');
  const checkKharaziJungle = regionUnlocks.includes('Kharazi Jungle');
  const checkCrandor = regionUnlocks.includes('Crandor');
  const checkPortSarim = regionUnlocks.includes('Port Sarim');
  const checkRimmington = regionUnlocks.includes('Rimmington');
  const checkCraftingGuild = regionUnlocks.includes('Crafting Guild');

  return (
    <div className="h-[600px] w-full bg-[#0b0d10] rounded-lg border border-white/10 relative overflow-hidden group select-none shadow-inner cursor-move">
      {isLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
      )}

      <div 
        ref={containerRef}
        className="w-full h-full"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <div 
          ref={mapContentRef}
          id="map-content-inner"
          style={{ 
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: '0 0',
            width: '4000px',
            height: '2600px',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        >
          <img 
            src={mapSrc} 
            alt="OSRS World Map" 
            crossOrigin="anonymous"
            className="w-full h-full object-fill pointer-events-none opacity-50 grayscale-[0.3]"
            draggable={false}
          />
          
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
             <polygon 
                points={karamjaPointsString}
                fill="transparent"
                stroke={regionUnlocks.includes('Karamja') ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)"}
                strokeWidth="0.02"
             />
             <polygon 
                points={musaPointPointsString}
                fill={regionUnlocks.includes('Musa Point') ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.2)"}
                stroke={regionUnlocks.includes('Musa Point') ? "rgba(16, 185, 129, 0.6)" : "rgba(239, 68, 68, 0.4)"}
                strokeWidth="0.04"
                className="hover:fill-current hover:text-white/10 transition-colors cursor-help"
             />
             <polygon 
                points={brimhavenPointsString}
                fill={regionUnlocks.includes('Brimhaven') ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.2)"}
                stroke={regionUnlocks.includes('Brimhaven') ? "rgba(16, 185, 129, 0.6)" : "rgba(239, 68, 68, 0.4)"}
                strokeWidth="0.04"
                className="hover:fill-current hover:text-white/10 transition-colors cursor-help"
             />
             <polygon 
                points={volcanoPointsString}
                fill={regionUnlocks.includes('Mor Ul Rek (TzHaar City)') ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.2)"}
                stroke={regionUnlocks.includes('Mor Ul Rek (TzHaar City)') ? "rgba(16, 185, 129, 0.6)" : "rgba(239, 68, 68, 0.4)"}
                strokeWidth="0.04"
                className="hover:fill-current hover:text-white/10 transition-colors cursor-help"
             />
             <polygon 
                points={shiloVillagePointsString}
                fill={checkShiloVillage ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.2)"}
                stroke={checkShiloVillage ? "rgba(16, 185, 129, 0.6)" : "rgba(239, 68, 68, 0.4)"}
                strokeWidth="0.04"
                className="hover:fill-current hover:text-white/10 transition-colors cursor-help"
             />
             <polygon 
                points={taiBwoWannaiPointsString}
                fill={checkTaiBwoWannai ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.2)"}
                stroke={checkTaiBwoWannai ? "rgba(16, 185, 129, 0.6)" : "rgba(239, 68, 68, 0.4)"}
                strokeWidth="0.04"
                className="hover:fill-current hover:text-white/10 transition-colors cursor-help"
             />
             <polygon 
                points={kharaziJunglePointsString}
                fill={checkKharaziJungle ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.2)"}
                stroke={checkKharaziJungle ? "rgba(16, 185, 129, 0.6)" : "rgba(239, 68, 68, 0.4)"}
                strokeWidth="0.04"
                className="hover:fill-current hover:text-white/10 transition-colors cursor-help"
             />
             <polygon 
                points={crandorPointsString}
                fill={checkCrandor ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.2)"}
                stroke={checkCrandor ? "rgba(16, 185, 129, 0.6)" : "rgba(239, 68, 68, 0.4)"}
                strokeWidth="0.04"
                className="hover:fill-current hover:text-white/10 transition-colors cursor-help"
             />
             <polygon 
                points={portSarimPointsString}
                fill={checkPortSarim ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.2)"}
                stroke={checkPortSarim ? "rgba(16, 185, 129, 0.6)" : "rgba(239, 68, 68, 0.4)"}
                strokeWidth="0.04"
                className="hover:fill-current hover:text-white/10 transition-colors cursor-help"
             />
             <polygon 
                points={rimmingtonPointsString}
                fill={checkRimmington ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.2)"}
                stroke={checkRimmington ? "rgba(16, 185, 129, 0.6)" : "rgba(239, 68, 68, 0.4)"}
                strokeWidth="0.04"
                className="hover:fill-current hover:text-white/10 transition-colors cursor-help"
             />
             <polygon 
                points={craftingGuildPointsString}
                fill={checkCraftingGuild ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.2)"}
                stroke={checkCraftingGuild ? "rgba(16, 185, 129, 0.6)" : "rgba(239, 68, 68, 0.4)"}
                strokeWidth="0.04"
                className="hover:fill-current hover:text-white/10 transition-colors cursor-help"
             />
             <polygon
                points={faladorPointsString}
                fill={regionUnlocks.includes('Falador') ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.2)"}
                stroke={regionUnlocks.includes('Falador') ? "rgba(16, 185, 129, 0.6)" : "rgba(239, 68, 68, 0.4)"}
                strokeWidth="0.04"
                className="hover:fill-current hover:text-white/10 transition-colors cursor-help"
             />
             <polygon
                points={apeAtollPointsString}
                fill={regionUnlocks.includes('Ape Atoll') ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.2)"}
                stroke={regionUnlocks.includes('Ape Atoll') ? "rgba(16, 185, 129, 0.6)" : "rgba(239, 68, 68, 0.4)"}
                strokeWidth="0.04"
                className="hover:fill-current hover:text-white/10 transition-colors cursor-help"
             />
             <polygon
                points={isleOfSoulsPointsString}
                fill={checkIsleOfSouls ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.2)"}
                stroke={checkIsleOfSouls ? "rgba(16, 185, 129, 0.6)" : "rgba(239, 68, 68, 0.4)"}
                strokeWidth="0.04"
                className="hover:fill-current hover:text-white/10 transition-colors cursor-help"
             />
             <polygon
                points={misthalinPointsString}
                fill="rgba(16, 185, 129, 0.3)"
                stroke="rgba(16, 185, 129, 0.6)"
                strokeWidth="0.04"
                className="hover:fill-current hover:text-white/10 transition-colors cursor-help"
             />
             <polygon
                points={fossilIslandPointsString}
                fill={checkFossilIsland ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.2)"}
                stroke={checkFossilIsland ? "rgba(16, 185, 129, 0.6)" : "rgba(239, 68, 68, 0.4)"}
                strokeWidth="0.04"
                className="hover:fill-current hover:text-white/10 transition-colors cursor-help"
             />
             <polygon
                points={lunarIslePointsString}
                fill={checkLunarIsle ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.2)"}
                stroke={checkLunarIsle ? "rgba(16, 185, 129, 0.6)" : "rgba(239, 68, 68, 0.4)"}
                strokeWidth="0.04"
                className="hover:fill-current hover:text-white/10 transition-colors cursor-help"
             />
          </svg>

          {Object.entries(REGION_COORDS).map(([region, coords]) => {
             const isMisthalin = region === 'Misthalin';
             const isUnlocked = isMisthalin || regionUnlocks.includes(region);
             const subRegions = isMisthalin ? MISTHALIN_AREAS : REGION_GROUPS[region] || [];

             return (
               <div 
                 key={region}
                 className="absolute transform -translate-x-1/2 -translate-y-1/2 group/marker z-10"
                 style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
               >
                 <div className={`
                    w-6 h-6 md:w-8 md:h-8 rounded-full border-2 shadow-[0_0_15px_black] flex items-center justify-center transition-all duration-300
                    ${isUnlocked 
                        ? 'bg-emerald-900/90 border-emerald-400 text-emerald-400 hover:scale-125 hover:bg-emerald-800' 
                        : 'bg-red-900/90 border-red-500 text-red-500 hover:scale-110 grayscale-[0.5]'}
                 `}>
                    {isUnlocked ? <Unlock size={14} /> : <Lock size={14} />}
                 </div>

                 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 bg-black/95 border border-white/20 rounded p-3 opacity-0 group-hover/marker:opacity-100 transition-opacity pointer-events-none z-50 flex flex-col gap-2 scale-90 group-hover/marker:scale-100 origin-bottom duration-200">
                    <h4 className={`font-bold text-sm border-b pb-1 ${isUnlocked ? 'text-emerald-400 border-emerald-500/30' : 'text-red-400 border-red-500/30'}`}>{region}</h4>
                    <div className="flex flex-wrap gap-1">
                        {subRegions.slice(0, 8).map(area => (
                            <span key={area} className={`text-[9px] px-1.5 py-0.5 rounded text-gray-300 ${regionUnlocks.includes(area) ? 'bg-emerald-900/40 text-emerald-300' : 'bg-white/10'}`}>{area}</span>
                        ))}
                        {subRegions.length > 8 && <span className="text-[9px] text-gray-500">+{subRegions.length - 8} more...</span>}
                    </div>
                 </div>
               </div>
             );
          })}
        </div>
      </div>

      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
        <button 
            onClick={handleExport}
            disabled={isExporting}
            className="p-2 bg-black/80 border border-white/20 rounded hover:bg-white/10 text-white shadow-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            title="Export Map Image"
        >
            {isExporting ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
        </button>
        <button 
            onClick={() => setTransform(prev => ({ ...prev, scale: Math.min(prev.scale + 0.5, 5) }))} 
            className="p-2 bg-black/80 border border-white/20 rounded hover:bg-white/10 text-white shadow-lg active:scale-95 transition-transform"
        >
            <ZoomIn size={20} />
        </button>
        <button 
            onClick={() => setTransform(prev => ({ ...prev, scale: Math.max(prev.scale - 0.5, 0.3) }))} 
            className="p-2 bg-black/80 border border-white/20 rounded hover:bg-white/10 text-white shadow-lg active:scale-95 transition-transform"
        >
            <ZoomOut size={20} />
        </button>
      </div>

      <div className="absolute top-4 left-4 pointer-events-none z-20">
         <div className="flex items-center gap-2 bg-black/80 px-3 py-1.5 rounded-full border border-white/10 text-xs text-gray-300 shadow-lg backdrop-blur-sm">
            <Move size={14} />
            <span>Drag to Pan • Scroll to Zoom</span>
         </div>
      </div>
    </div>
  );
}, (prev, next) => {
    // Only re-render if the regions array reference or length changes.
    // In our reducer, the array reference changes on unlock, so referential equality is correct.
    return prev.regionUnlocks === next.regionUnlocks;
});

export const RegionMap: React.FC = () => {
  const { unlocks } = useGame();
  return <MapContent regionUnlocks={unlocks.regions} />;
};
