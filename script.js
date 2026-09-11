(function(){
  "use strict";

  // ---------- Definisi elemen ----------
  const EMPTY=0, SAND=1, WATER=2, STONE=3, WOOD=4, FIRE=5, SMOKE=6,
        ACID=7, LAVA=8, PLANT=9, ICE=10, OIL=11, STEAM=12,
        GUNPOWDER=13, SNOW=14, GLASS=15, METAL=16, DIRT=17, MOLTEN_GLASS=18, DUST=19, ASH=20,
        CEMENT=21, CONCRETE=22, TNT=23, DYNAMITE=24, IRON=25, RUST=26,
        CHOCOLATE=27, CHOCOLATE_MELT=28, HYDROGEN=29, METHANE=30, VOID=31, OXYGEN=32;

  const HEAT_MAX = 90; // durasi (tick) logam tetap panas & bisa merambatkan panas
  const GLASS_COOL = 150; // durasi (tick) kaca cair tetap cair sebelum membeku lagi
  const BURN_TIME = 35; // durasi (tick) 1 pixel benda mudah terbakar sebelum jadi abu

  const INFO = {
    [EMPTY]: { name:"Hapus",   color:[8,8,10],     cat:"empty" },
    [SAND]:  { name:"Pasir",   color:[224,196,116], cat:"powder", density:5, glow:"rgba(224,196,116,.6)", group:"Serbuk" },
    [DIRT]:  { name:"Tanah",   color:[104,70,42],  cat:"powder", density:6, glow:"rgba(104,70,42,.6)", shadeLevels:[-2,2], group:"Serbuk" },
    [WATER]: { name:"Air",     color:[58,132,224],  cat:"liquid", density:3, disperse:6, glow:"rgba(58,132,224,.6)", group:"Cairan" },
    [STONE]: { name:"Batu",    color:[110,112,120], cat:"solid", glow:"rgba(160,160,170,.5)", group:"Padat" },
    [WOOD]:  { name:"Kayu",    color:[122,80,46],   cat:"solid", flammable:true, glow:"rgba(122,80,46,.6)", group:"Padat" },
    [FIRE]:  { name:"Api",     color:[255,120,30],  cat:"gas", life:45, glow:"rgba(255,120,30,.7)", group:"Energi" },
    [SMOKE]: { name:"Asap",    color:[95,95,100],   cat:"gas", life:90, glow:"rgba(150,150,155,.5)", group:"Gas" },
    [ACID]:  { name:"Asam",    color:[150,224,60],  cat:"liquid", density:3, disperse:5, uses:4, glow:"rgba(150,224,60,.6)", group:"Cairan" },
    [LAVA]:  { name:"Lava",    color:[235,80,20],   cat:"liquid", density:7, disperse:1, glow:"rgba(235,80,20,.7)", group:"Cairan" },
    [PLANT]: { name:"Tanaman", color:[42,168,64],   cat:"solid", flammable:true, glow:"rgba(42,168,64,.6)", group:"Kehidupan" },
    [ICE]:   { name:"Es",      color:[195,232,240], cat:"solid", glow:"rgba(195,232,240,.6)", group:"Padat" },
    [OIL]:   { name:"Minyak",  color:[95,72,40],    cat:"liquid", density:2, disperse:3, flammable:true, glow:"rgba(95,72,40,.6)", shadeLevels:[-2,2], group:"Cairan" },
    [STEAM]: { name:"Uap",     color:[205,208,215], cat:"gas", life:70, glow:"rgba(205,208,215,.5)", group:"Gas" },
    [GUNPOWDER]: { name:"Mesiu", color:[75,75,82],  cat:"powder", density:5, glow:"rgba(255,180,60,.8)", group:"Senjata" },
    [SNOW]:  { name:"Salju",   color:[238,246,250], cat:"powder", density:4, glow:"rgba(238,246,250,.6)", group:"Serbuk" },
    [GLASS]: { name:"Kaca",    color:[150,214,222], cat:"solid", glow:"rgba(150,214,222,.6)", meltChance:0.03, fragile:true, group:"Padat" },
    [METAL]: { name:"Logam",   color:[182,187,197], cat:"solid", glow:"rgba(182,187,197,.6)", meltChance:0.004, group:"Padat" },
    [MOLTEN_GLASS]: { name:"Kaca Cair", color:[255,190,90], cat:"liquid", density:6, disperse:1, life:GLASS_COOL, glow:"rgba(255,190,90,.8)", group:"Cairan" },
    [DUST]:  { name:"Debu",    color:[130,120,105], cat:"powder", density:1, glow:"rgba(130,120,105,.6)", group:"Serbuk" },
    [ASH]:   { name:"Abu",     color:[150,146,140], cat:"powder", density:2, glow:"rgba(150,146,140,.6)", shadeLevels:[-2,0,2], group:"Serbuk" },

    [CEMENT]:   { name:"Semen",  color:[150,148,142], cat:"powder", density:6, glow:"rgba(150,148,142,.6)", group:"Serbuk" },
    [CONCRETE]: { name:"Beton",  color:[130,130,128], cat:"solid", glow:"rgba(130,130,128,.5)", meltChance:0.01, group:"Padat" },
    [TNT]:      { name:"TNT",    color:[210,60,50],  cat:"powder", density:5, glow:"rgba(255,60,50,.8)", group:"Senjata", fixedStamp:[2,2] },
    [DYNAMITE]: { name:"Dinamit", color:[190,40,40], cat:"powder", density:5, glow:"rgba(255,60,50,.8)", group:"Senjata", fixedStamp:[1,2] },
    [IRON]:     { name:"Besi",   color:[160,160,165], cat:"solid", glow:"rgba(160,160,165,.5)", meltChance:0.006, group:"Padat" },
    [RUST]:     { name:"Karat",  color:[150,80,40],  cat:"solid", glow:"rgba(150,80,40,.5)", group:"Serbuk" },
    [CHOCOLATE]:{ name:"Coklat", color:[92,58,36],   cat:"solid", glow:"rgba(92,58,36,.6)", group:"Makanan" },
    [CHOCOLATE_MELT]: { name:"Coklat Cair", color:[110,70,42], cat:"liquid", density:3, disperse:3, glow:"rgba(110,70,42,.6)", group:"Makanan" },
    [HYDROGEN]: { name:"Hidrogen", color:[220,235,255], cat:"gas", life:120, glow:"rgba(220,235,255,.6)", group:"Gas" },
    [METHANE]:  { name:"Metana", color:[200,220,180], cat:"gas", life:120, flammable:true, glow:"rgba(200,220,180,.6)", group:"Gas" },
    [VOID]:     { name:"Void",   color:[15,4,20],    cat:"solid", glow:"rgba(120,0,180,.8)", group:"Spesial" },
    [OXYGEN]:   { name:"Oksigen", color:[190,215,255], cat:"gas", life:150, glow:"rgba(190,215,255,.6)", group:"Gas" },
  };

  // Elemen "sederhana": cuma butuh kategori fisik + tampilan, tanpa reaksi unik.
  // ID-nya dibuat otomatis lanjut dari elemen bernama di atas, jadi nambah elemen
  // baru ke depannya tinggal nambah satu baris di sini, gak perlu ubah kode inti.
  let _nextId = OXYGEN + 1;
  const SIMPLE_DEFS = [
    // ---- Cairan ----
    { name:"Air Garam", color:[130,168,214], cat:"liquid", density:3.2, disperse:6, group:"Cairan" },
    { name:"Madu",       color:[214,150,20],  cat:"liquid", density:4, disperse:1, group:"Cairan" },
    { name:"Sirup",      color:[120,60,30],   cat:"liquid", density:4, disperse:1, group:"Cairan" },
    { name:"Lem",        color:[225,225,215], cat:"liquid", density:4, disperse:1, group:"Cairan" },
    { name:"Susu",       color:[240,240,230], cat:"liquid", density:3, disperse:5, group:"Cairan" },
    { name:"Alkohol",    color:[210,230,240], cat:"liquid", density:2, disperse:6, flammable:true, group:"Cairan" },
    { name:"Merkuri",    color:[200,200,210], cat:"liquid", density:9, disperse:4, group:"Cairan" },
    { name:"Racun",      color:[120,200,90],  cat:"liquid", density:3, disperse:5, group:"Cairan" },
    { name:"Sabun",      color:[230,220,235], cat:"liquid", density:2, disperse:5, group:"Cairan" },
    { name:"Cuka",       color:[224,220,150], cat:"liquid", density:3, disperse:6, group:"Cairan" },

    // ---- Kehidupan ----
    { name:"Rumput", color:[70,168,60],  cat:"solid", flammable:true, group:"Kehidupan" },
    { name:"Lumut",  color:[90,120,70],  cat:"solid", flammable:true, group:"Kehidupan" },
    { name:"Cacing", color:[190,140,150], cat:"powder", density:3, group:"Kehidupan" },
    { name:"Semut",  color:[40,30,25],   cat:"powder", density:2, group:"Kehidupan" },
    { name:"Ikan",   color:[120,150,180],cat:"powder", density:3, group:"Kehidupan" },

    // ---- Serbuk ----
    { name:"Arang",        color:[45,42,40],   cat:"powder", density:4, flammable:true, group:"Serbuk" },
    { name:"Serbuk Kayu",  color:[195,165,110],cat:"powder", density:2, flammable:true, group:"Serbuk" },
    { name:"Lilin",        color:[235,225,190],cat:"powder", density:3, flammable:true, group:"Serbuk" },
    { name:"Belerang",     color:[220,200,60], cat:"powder", density:3, flammable:true, group:"Serbuk" },
    { name:"Serpihan Logam", color:[170,172,178], cat:"powder", density:6, group:"Serbuk" },
    { name:"Pecahan Kaca", color:[170,220,225], cat:"powder", density:5, group:"Serbuk" },
    { name:"Confetti",     color:[230,80,160],  cat:"powder", density:1, shadeLevels:[-40,-20,0,20,40], group:"Serbuk" },
    { name:"Pasir Warna",  color:[220,100,130], cat:"powder", density:5, shadeLevels:[-30,0,30], group:"Serbuk" },

    // ---- Padat ----
    { name:"Tembok",  color:[90,90,95],   cat:"solid", group:"Padat" },
    { name:"Bata",    color:[150,70,55],  cat:"solid", group:"Padat" },
    { name:"Kain",    color:[220,220,225],cat:"solid", flammable:true, group:"Padat" },
    { name:"Kertas",  color:[235,232,220],cat:"solid", flammable:true, group:"Padat" },
    { name:"Plastik", color:[220,60,120], cat:"solid", flammable:true, group:"Padat" },
    { name:"Tembaga", color:[195,110,70], cat:"solid", meltChance:0.006, group:"Padat" },
    { name:"Emas",    color:[230,190,60], cat:"solid", group:"Padat" },
    { name:"Baja",    color:[140,150,160],cat:"solid", meltChance:0.003, group:"Padat" },
    { name:"Perak",   color:[210,210,215],cat:"solid", meltChance:0.006, group:"Padat" },

    // ---- Energi ----
    { name:"Plasma",   color:[255,80,220], cat:"gas", life:60, diffuse:true, group:"Energi" },
    { name:"Listrik",  color:[255,240,90], cat:"gas", life:20, group:"Energi" },
    { name:"Radiasi",  color:[170,230,60], cat:"gas", life:200, diffuse:true, group:"Energi" },

    // ---- Senjata ----
    { name:"Granat",      color:[80,100,70],  cat:"solid", group:"Senjata" },
    { name:"Kembang Api", color:[255,200,80], cat:"powder", density:3, shadeLevels:[-60,-30,0,30,60], group:"Senjata" },

    // ---- Gas ----
    { name:"Klorin", color:[210,230,120], cat:"gas", life:150, group:"Gas" },
    { name:"Neon",   color:[255,120,140], cat:"gas", life:150, group:"Gas" },

    // ---- Makanan ----
    { name:"Garam",  color:[235,235,235], cat:"powder", density:5, group:"Makanan" },
    { name:"Gula",   color:[250,250,245], cat:"powder", density:4, group:"Makanan" },
    { name:"Tepung", color:[245,240,225], cat:"powder", density:2, flammable:true, group:"Makanan" },
    { name:"Keju",   color:[245,210,90],  cat:"solid", group:"Makanan" },
    { name:"Roti",   color:[200,155,90],  cat:"solid", flammable:true, group:"Makanan" },

    // ---- Mesin: belum ada logika sirkuit/sinyal, lihat renderElementsForGroup() ----

    // ---- Spesial ----
    { name:"Pelangi", color:[255,255,255], cat:"powder", density:3, shadeLevels:[-90,-60,-30,0,30,60,90], group:"Spesial" },
  ];
  SIMPLE_DEFS.forEach(def => { INFO[_nextId++] = def; });

  let GLASS_SHARD_ID = SAND; // fallback, ditimpa di bawah kalau ketemu
  for(const idStr in INFO){ if(INFO[idStr].name==="Pecahan Kaca"){ GLASS_SHARD_ID = Number(idStr); break; } }

  // Urutan tab kategori yang tampil di toolbar
  const CATEGORY_ORDER = ["Serbuk","Cairan","Padat","Gas","Energi","Senjata","Makanan","Kehidupan","Mesin","Spesial"];

  const isLiquid = t => INFO[t] && INFO[t].cat === "liquid";
  const density  = t => (INFO[t] && INFO[t].density) || 0;
  const flammable= t => !!(INFO[t] && INFO[t].flammable);

  // ---------- Canvas & grid ----------
  const canvas = document.getElementById("sandbox");
  const ctx = canvas.getContext("2d", { alpha:true });
  const wrap = document.getElementById("canvasWrap");

  let CELL = 6; // ukuran tiap sel dalam px CSS — makin kecil = makin banyak pixel (detail)
  const DPR = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
  let cols, rows, grid, life, shade, updated, rigidMask, imgData, buf;
  let rigidBodies = [];
  let heldBody = null;
  const off = document.createElement("canvas");
  const octx = off.getContext("2d", { alpha:true });

  function setupGrid(){
    const availW = wrap.clientWidth - 4;
    const availH = wrap.clientHeight - 4;
    const newCols = Math.max(20, Math.floor(availW / CELL));
    const newRows = Math.max(20, Math.floor(availH / CELL));
    applyGridSize(newCols, newRows);
  }

  function applyGridSize(newCols, newRows){
    cols = newCols; rows = newRows;

    grid = new Uint8Array(cols*rows);
    life = new Uint8Array(cols*rows);
    shade = new Int8Array(cols*rows);
    updated = new Uint8Array(cols*rows);
    rigidMask = new Uint8Array(cols*rows);
    rigidBodies = [];
    heldBody = null;

    // canvas offscreen resolusi rendah (1 pixel = 1 sel)
    off.width = cols;
    off.height = rows;
    octx.imageSmoothingEnabled = false;

    // canvas layar: resolusi fisik pas devicePixelRatio agar tidak ada celah/garis saat di-upscale
    canvas.width = Math.round(cols * CELL * DPR);
    canvas.height = Math.round(rows * CELL * DPR);
    canvas.style.width = (cols*CELL) + "px";
    canvas.style.height = (rows*CELL) + "px";
    ctx.imageSmoothingEnabled = false;

    imgData = octx.createImageData(cols, rows);
    buf = imgData.data;
  }

  const idx = (x,y) => y*cols + x;
  const inb = (x,y) => x>=0 && x<cols && y>=0 && y<rows;
  const isOpen = (x,y) => inb(x,y) && grid[idx(x,y)]===EMPTY && !rigidMask[idx(x,y)];

  function forEachNeighbor8(x,y,fn){
    for(let dy=-1; dy<=1; dy++){
      for(let dx=-1; dx<=1; dx++){
        if(dx===0 && dy===0) continue;
        const nx=x+dx, ny=y+dy;
        if(inb(nx,ny)) fn(nx,ny, idx(nx,ny));
      }
    }
  }
  function forEachNeighbor4(x,y,fn){
    const d = [[0,-1],[0,1],[-1,0],[1,0]];
    for(const [dx,dy] of d){
      const nx=x+dx, ny=y+dy;
      if(inb(nx,ny)) fn(nx,ny, idx(nx,ny));
    }
  }

  // ---------- Ledakan (Bubuk Mesiu) ----------
  let _explosionDepth = 0;
  function explode(x,y,radius){
    if(_explosionDepth > 40) return; // pengaman: cegah rantai ledakan tak berkesudahan
    _explosionDepth++;
    knockbackBodies(x,y,radius);
    for(let dy=-radius; dy<=radius; dy++){
      for(let dx=-radius; dx<=radius; dx++){
        if(dx*dx+dy*dy > radius*radius+1) continue;
        const nx=x+dx, ny=y+dy;
        if(!inb(nx,ny)) continue;
        const j = idx(nx,ny);
        const nt = grid[j];
        if(nt===STONE || nt===METAL || nt===GLASS) continue; // tahan sebagian ledakan
        if(nt===GUNPOWDER){ grid[j]=FIRE; life[j]=INFO[FIRE].life; continue; } // rambat ke mesiu lain
        if(nt===TNT || nt===DYNAMITE){ grid[j]=EMPTY; life[j]=0; explode(nx,ny, nt===TNT?6:4); continue; } // rantai ledakan
        if(Math.random()<0.55){ grid[j]=FIRE; life[j]=INFO[FIRE].life; }
        else if(Math.random()<0.4){ grid[j]=DUST; life[j]=0; }
        else { grid[j]=EMPTY; life[j]=0; }
      }
    }
    for(let bi=rigidBodies.length-1; bi>=0; bi--){
      const b = rigidBodies[bi];
      if(b===heldBody) continue;
      const bx = Math.round(b.bx), by = Math.round(b.by);
      for(let ci=b.cells.length-1; ci>=0; ci--){
        const c = b.cells[ci];
        const cx = bx+c.dx, cy = by+c.dy;
        const ddx=cx-x, ddy=cy-y;
        if(ddx*ddx+ddy*ddy > radius*radius+1) continue;
        if(c.t===TNT || c.t===DYNAMITE){
          b.cells.splice(ci,1);
          explode(cx,cy, c.t===TNT?6:4);
          continue;
        }
        const tough = INFO[c.t] && INFO[c.t].cat==='solid' && !INFO[c.t].flammable && !INFO[c.t].fragile;
        if(tough && Math.random()<0.6) continue; // Logam/Batu dkk cukup tahan ledakan
        if(Math.random()<0.6){
          if(inb(cx,cy) && grid[idx(cx,cy)]===EMPTY){ grid[idx(cx,cy)]=DUST; life[idx(cx,cy)]=0; }
          b.cells.splice(ci,1);
        }
      }
      if(b.cells.length===0) rigidBodies.splice(bi,1);
    }
    _explosionDepth--;
  }

  // ---------- Benda Fisika (rigid body) ----------
  const RIGID_GRAVITY = 0.05;
  const RIGID_MAX_FALL = 1.2;
  const RIGID_FRICTION = 0.85;

  function rebuildRigidMask(){
    rigidMask.fill(0);
    for(const b of rigidBodies){
      const bx = Math.round(b.bx), by = Math.round(b.by);
      for(const c of b.cells){
        const x=bx+c.dx, y=by+c.dy;
        if(inb(x,y)) rigidMask[idx(x,y)] = 1;
      }
    }
  }

  // Cuma menghalangi kalau kena dinding/lantai atau elemen SOLID (Batu/Kayu/Logam/dst).
  // Benda fisika lain ditangani terpisah lewat tryPushBodyBy (biar bisa saling dorong),
  // dan material lepas (pasir/air/gas) ditangani lewat pushLooseMaterialFor (didorong).
  function hardBlocked(body, testBx, testBy){
    const bx = Math.round(testBx), by = Math.round(testBy);
    for(const c of body.cells){
      const x = bx+c.dx, y = by+c.dy;
      if(y >= rows) return true; // lantai
      if(x < 0 || x >= cols) return true; // dinding samping
      if(y < 0) continue; // masih di atas layar, biarkan lewat
      const t = grid[idx(x,y)];
      if(t !== EMPTY && INFO[t] && INFO[t].cat === 'solid') return true;
    }
    return false;
  }

  // Cari benda fisika (termasuk yang lagi digenggam) yang menempati sel (x,y), selain `exclude`.
  function bodyOwnerAt(x, y, exclude){
    for(const b of rigidBodies){
      if(b===exclude) continue;
      const bx = Math.round(b.bx), by = Math.round(b.by);
      for(const c of b.cells){
        if(bx+c.dx===x && by+c.dy===y) return b;
      }
    }
    if(heldBody && heldBody!==exclude){
      const bx = Math.round(heldBody.bx), by = Math.round(heldBody.by);
      for(const c of heldBody.cells){
        if(bx+c.dx===x && by+c.dy===y) return heldBody;
      }
    }
    return null;
  }

  // Coba geser `mover` sejauh (dx,dy). Kalau di jalan ketemu benda fisika lain,
  // coba dorong benda itu juga sejauh yang sama secara rekursif (efek domino) —
  // seluruh rantai cuma bergerak kalau ujung rantainya benar-benar bebas.
  function tryPushBodyBy(mover, dx, dy, visited){
    if(visited.has(mover)) return false;
    visited.add(mover);

    const nbx = mover.bx+dx, nby = mover.by+dy;
    if(hardBlocked(mover, nbx, nby)) return false;

    const bx = Math.round(nbx), by = Math.round(nby);
    const others = new Set();
    for(const c of mover.cells){
      const x = bx+c.dx, y = by+c.dy;
      if(!inb(x,y)) continue;
      const ob = bodyOwnerAt(x, y, mover);
      if(ob) others.add(ob);
    }
    for(const ob of others){
      if(!tryPushBodyBy(ob, dx, dy, visited)) return false;
    }

    mover.bx = nbx; mover.by = nby;
    return true;
  }

  // Sapu ulang footprint benda; material lepas (bukan solid) yang "ketiban" badan
  // didorong ke sel kosong terdekat (diutamakan searah gerakan), bukan cuma dihalangi.
  function pushLooseMaterialFor(body, dirX, dirY){
    const bx = Math.round(body.bx), by = Math.round(body.by);
    const prefs = [[dirX||0,dirY||0], [1,0], [-1,0], [0,-1], [0,1], [1,1], [-1,1], [1,-1], [-1,-1]];
    for(const c of body.cells){
      const x = bx+c.dx, y = by+c.dy;
      if(!inb(x,y)) continue;
      const i = idx(x,y);
      const t = grid[i];
      if(t===EMPTY) continue;
      if(INFO[t] && INFO[t].cat === 'solid') continue; // seharusnya sudah tercegah lewat hardBlocked
      let placed = false;
      for(const [ox,oy] of prefs){
        const nx=x+ox, ny=y+oy;
        if(!inb(nx,ny)) continue;
        const j = idx(nx,ny);
        if(grid[j]===EMPTY && !rigidMask[j]){
          grid[j]=grid[i]; life[j]=life[i]; shade[j]=shade[i];
          placed = true;
          break;
        }
      }
      grid[i]=EMPTY; life[i]=0; shade[i]=0;
      void placed; // kalau gak ketemu tempat, material itu termampatkan/hilang (kasus langka)
    }
  }

  function clearBodyMask(b){
    const bx = Math.round(b.bx), by = Math.round(b.by);
    for(const c of b.cells){
      const x=bx+c.dx, y=by+c.dy;
      if(inb(x,y)) rigidMask[idx(x,y)] = 0;
    }
  }
  function stampBodyMask(b){
    const bx = Math.round(b.bx), by = Math.round(b.by);
    for(const c of b.cells){
      const x=bx+c.dx, y=by+c.dy;
      if(inb(x,y)) rigidMask[idx(x,y)] = 1;
    }
  }

  // Menggerakkan benda yang sedang digenggam (drag) menuju target selangkah demi
  // selangkah. Kalau ketemu benda fisika lain, coba dorong (efek domino); kalau
  // ketemu dinding/solid, berhenti di titik terjauh yang masih bebas.
  function moveHeldBodyTo(body, nbx, nby){
    const startX = body.bx, startY = body.by;
    const dx = nbx-startX, dy = nby-startY;
    const dist = Math.max(Math.abs(dx), Math.abs(dy));
    if(dist > 0.0001){
      const steps = Math.max(Math.ceil(dist), 1);
      for(let s=1; s<=steps; s++){
        const targetX = startX + dx*s/steps;
        const targetY = startY + dy*s/steps;
        const sx = targetX - body.bx, sy = targetY - body.by;
        if(!tryPushBodyBy(body, sx, sy, new Set())) break;
      }
    }
    pushLooseMaterialFor(body, Math.sign(dx), Math.sign(dy));
  }

  function updateRigidBodies(){
    for(const b of rigidBodies){
      clearBodyMask(b); // lepas dulu biar gak dianggap nabrak diri sendiri
    }

    for(const b of rigidBodies){
      b.vy = Math.min(RIGID_MAX_FALL, b.vy + RIGID_GRAVITY);

      // horizontal: geser 1 sel per langkah, coba dorong benda lain di jalan (domino).
      // Kalau kehalang, berhenti bersih (tanpa "melompat" naik) biar gerakannya mulus.
      if(b.vx !== 0){
        const dir = b.vx > 0 ? 1 : -1;
        const steps = Math.ceil(Math.abs(b.vx));
        let moved = 0;
        for(let s=0; s<steps; s++){
          if(tryPushBodyBy(b, dir, 0, new Set())) moved++;
          else break;
        }
        if(moved < steps) b.vx = 0;
      }

      // vertikal: sama, geser 1 sel per langkah, coba dorong benda lain di jalan.
      // Kalau kehalang padahal lagi jatuh cukup kencang, itu artinya mendarat keras —
      // bisa memicu material rapuh (Kaca) di badan ini pecah.
      if(b.vy !== 0){
        const impactSpeed = b.vy;
        const dir = b.vy > 0 ? 1 : -1;
        const steps = Math.ceil(Math.abs(b.vy));
        let moved = 0;
        for(let s=0; s<steps; s++){
          if(tryPushBodyBy(b, 0, dir, new Set())) moved++;
          else break;
        }
        if(moved < steps){
          if(impactSpeed > 0.5) shatterFragileCells(b, impactSpeed);
          b.vy = 0;
        }
      }

      if(b.vy === 0){
        b.vx *= RIGID_FRICTION;
        if(Math.abs(b.vx) < 0.02) b.vx = 0;
      }

      pushLooseMaterialFor(b, b.vx>0?1:(b.vx<0?-1:0), b.vy>0?1:(b.vy<0?-1:0));
      stampBodyMask(b); // tempel lagi ke mask di posisi terbaru
    }
  }

  function findBodyAt(x,y){
    for(const b of rigidBodies){
      const bx = Math.round(b.bx), by = Math.round(b.by);
      for(const c of b.cells){
        if(bx+c.dx===x && by+c.dy===y) return b;
      }
    }
    return null;
  }

  function knockbackBodies(ex, ey, radius){
    const reach = radius * 2.5;
    for(const b of rigidBodies){
      const left = b.bx, right = b.bx + b.w - 1;
      const top = b.by, bottom = b.by + b.h - 1;
      // titik terdekat di kotak pembatas benda ke pusat ledakan (biar benda besar/agak jauh tetap kena)
      const nearestX = Math.max(left, Math.min(ex, right));
      const nearestY = Math.max(top, Math.min(ey, bottom));
      const distEdge = Math.hypot(nearestX-ex, nearestY-ey);
      if(distEdge >= reach) continue;

      const cx = b.bx + b.w/2, cy = b.by + b.h/2;
      const ddx = cx-ex, ddy = cy-ey;
      const dlen = Math.hypot(ddx,ddy) || 0.001;
      const force = (1 - distEdge/reach) * 2.5;
      b.vx += (ddx/dlen) * force;
      b.vy += (ddy/dlen) * force - force*0.35; // sedikit bias ke atas biar kelihatan "mental"
      shatterFragileCells(b, force);
    }
  }
  const isSolidOrPowder = t => { const c = INFO[t] && INFO[t].cat; return c==='solid' || c==='powder'; };

  // Material rapuh (Kaca, dst — tandai lewat INFO[t].fragile) di dalam benda fisika
  // pecah jadi Pecahan Kaca kalau kena benturan/dorongan cukup keras.
  function shatterFragileCells(body, force){
    if(force < 0.5) return;
    const bx = Math.round(body.bx), by = Math.round(body.by);
    const chance = Math.min(0.9, force*0.3);
    for(let ci=body.cells.length-1; ci>=0; ci--){
      const c = body.cells[ci];
      if(INFO[c.t] && INFO[c.t].fragile && Math.random() < chance){
        const x=bx+c.dx, y=by+c.dy;
        if(inb(x,y) && grid[idx(x,y)]===EMPTY){
          grid[idx(x,y)] = GLASS_SHARD_ID; life[idx(x,y)]=0; shade[idx(x,y)]=0;
        }
        body.cells.splice(ci,1);
      }
    }
  }

  // Sel-sel di dalam benda fisika mewarisi sifat elemen aslinya: Mesiu tetap bisa
  // meledak, benda mudah terbakar (Kayu, Kain, dst) tetap bisa terbakar pelan lalu
  // hancur jadi Abu dan lepas dari badan, disiram Air/Asam bisa padam.
  function updateBodyMaterials(){
    const pendingExplosions = []; // ledakan ditunda, dieksekusi SETELAH semua badan selesai dipindai —
                                   // biar explode() gak ubah array cells di tengah-tengah iterasi (itu penyebab macet totalnya)
    for(let bi=rigidBodies.length-1; bi>=0; bi--){
      const b = rigidBodies[bi];
      if(b===heldBody) continue;
      const bx = Math.round(b.bx), by = Math.round(b.by);
      const lookup = new Map();
      b.cells.forEach((c,ci)=> lookup.set(c.dx+','+c.dy, ci));

      const toRemove = [];
      for(let ci=0; ci<b.cells.length; ci++){
        const c = b.cells[ci];
        const x = bx+c.dx, y = by+c.dy;
        if(!inb(x,y)) continue;
        const t = c.t;

        let touchingHeat=false, touchingWater=false;
        for(let ddy=-1; ddy<=1; ddy++){
          for(let ddx=-1; ddx<=1; ddx++){
            if(ddx===0 && ddy===0) continue;
            const nx=x+ddx, ny=y+ddy;
            if(!inb(nx,ny)) continue;
            const ngt = grid[idx(nx,ny)];
            if(ngt===FIRE || ngt===LAVA) touchingHeat=true;
            if(ngt===WATER || ngt===ACID) touchingWater=true;
          }
        }

        if(t===GUNPOWDER){
          if(touchingHeat){ pendingExplosions.push([x,y,3]); toRemove.push(ci); }
          continue;
        }
        if(t===METAL){
          if(touchingHeat){ c.l = HEAT_MAX; }
          if(c.l>0){
            c.l--;
            for(let ddy=-1; ddy<=1; ddy++){
              for(let ddx=-1; ddx<=1; ddx++){
                if(!ddx && !ddy) continue;
                const ni = lookup.get((c.dx+ddx)+','+(c.dy+ddy));
                if(ni!==undefined){
                  const nc = b.cells[ni];
                  if(nc.t===METAL && (nc.l||0) < c.l-1) nc.l = c.l-1;
                }
              }
            }
          }
          continue;
        }
        if(flammable(t) && isSolidOrPowder(t)){
          if(touchingWater && c.l>0){ c.l=0; continue; }
          if(touchingHeat && !c.l){ c.l = BURN_TIME; }
          if(c.l>0){
            c.l--;
            if(c.l<=0){ toRemove.push(ci); continue; }
            if(Math.random()<0.05){
              for(let ddy=-1; ddy<=1; ddy++){
                for(let ddx=-1; ddx<=1; ddx++){
                  if(!ddx && !ddy) continue;
                  const ni = lookup.get((c.dx+ddx)+','+(c.dy+ddy));
                  if(ni!==undefined){
                    const nc = b.cells[ni];
                    if(flammable(nc.t) && isSolidOrPowder(nc.t) && !nc.l) nc.l = BURN_TIME;
                  }
                }
              }
            }
          }
        }
      }

      toRemove.sort((a,z)=>z-a).forEach(ci=>{
        const c = b.cells[ci];
        const x = bx+c.dx, y = by+c.dy;
        if(inb(x,y) && grid[idx(x,y)]===EMPTY){ grid[idx(x,y)]=ASH; life[idx(x,y)]=0; shade[idx(x,y)]=0; }
        b.cells.splice(ci,1);
      });

      if(b.cells.length===0) rigidBodies.splice(bi,1);
    }
    pendingExplosions.forEach(([ex,ey,er]) => explode(ex,ey,er));
  }

  function ignite(j, nt){
    if(isSolidOrPowder(nt)){
      if(!life[j]) life[j] = BURN_TIME; // mulai terbakar pelan-pelan (kalau belum menyala)
    } else {
      grid[j]=FIRE; life[j]=INFO[FIRE].life; // cairan/gas mudah terbakar: langsung jadi api
    }
  }

  function tickBurning(i,x,y){
    if(life[i]<=0) return false; // tidak sedang terbakar
    forEachNeighbor8(x,y,(nx,ny,j)=>{
      const nt = grid[j];
      if(nt===EMPTY){
        if(Math.random()<0.1){ grid[j]=FIRE; life[j]=INFO[FIRE].life; } // lidah api yang kelihatan menyala
        return;
      }
      if((nt===WATER || nt===ACID) && Math.random()<0.5){ life[i]=0; return; } // disiram, padam sebelum jadi abu
      if(!flammable(nt)) return;
      if(isSolidOrPowder(nt)){
        if(!life[j] && Math.random()<0.045) life[j] = BURN_TIME;
      } else if(Math.random()<0.25){
        grid[j]=FIRE; life[j]=INFO[FIRE].life;
      }
    });
    if(life[i]>0){
      life[i]--;
      if(life[i]<=0){ grid[i]=ASH; life[i]=0; }
    }
    return true;
  }

  // ---------- Reaksi antar elemen ----------
  function reactionPass(){
    for(let y=0;y<rows;y++){
      for(let x=0;x<cols;x++){
        const i = idx(x,y);
        const t = grid[i];
        if(t===EMPTY) continue;

        if(t===LAVA){
          forEachNeighbor8(x,y,(nx,ny,j)=>{
            const nt = grid[j];
            if(nt===WATER && Math.random()<0.35){
              grid[i]=STONE; life[i]=0;
              grid[j]=STEAM; life[j]=INFO[STEAM].life;
            } else if(flammable(nt) && Math.random()<0.18){
              ignite(j, nt);
            } else if((nt===ICE || nt===SNOW) && Math.random()<0.25){
              grid[j]=WATER; life[j]=0;
            } else if(nt===GUNPOWDER && Math.random()<0.4){
              explode(nx,ny,3);
            } else if((nt===GLASS || nt===SAND) && Math.random() < (nt===GLASS?INFO[GLASS].meltChance:0.02)){
              grid[j]=MOLTEN_GLASS; life[j]=GLASS_COOL;
            } else if(INFO[nt] && INFO[nt].meltChance && Math.random() < INFO[nt].meltChance){
              grid[j]=LAVA; life[j]=0; // logam apa pun yang punya meltChance otomatis bisa lebur
            }
          });
        } else if(t===MOLTEN_GLASS){
          let stillHot = false;
          forEachNeighbor8(x,y,(nx,ny,j)=>{
            const nt = grid[j];
            if(nt===LAVA || nt===FIRE) stillHot = true;
            else if(nt===METAL && life[j]>0) stillHot = true;
            else if(flammable(nt) && Math.random()<0.1){ ignite(j, nt); }
            else if(nt===WATER && Math.random()<0.3){ grid[j]=STEAM; life[j]=INFO[STEAM].life; }
          });
          if(stillHot){ life[i] = GLASS_COOL; }
          else {
            life[i]--;
            if(life[i]<=0){ grid[i]=GLASS; life[i]=0; }
          }
        } else if(t===METAL){
          let touchingHeat = false;
          forEachNeighbor8(x,y,(nx,ny,j)=>{ if(grid[j]===FIRE || grid[j]===LAVA) touchingHeat = true; });
          if(touchingHeat) life[i] = HEAT_MAX;
          if(life[i] > 0){
            forEachNeighbor8(x,y,(nx,ny,j)=>{
              const nt = grid[j];
              if(nt===METAL && life[j] < life[i]-1){
                life[j] = life[i]-1; // rambatkan panas ke logam tetangga (berkurang sedikit tiap sel)
              } else if(nt===WATER && Math.random()<0.05){
                grid[j]=STEAM; life[j]=INFO[STEAM].life;
              } else if((nt===ICE || nt===SNOW) && Math.random()<0.1){
                grid[j]=WATER; life[j]=0;
              } else if(flammable(nt) && Math.random()<0.015){
                ignite(j, nt);
              } else if(nt===SAND && Math.random()<0.01){
                grid[j]=MOLTEN_GLASS; life[j]=GLASS_COOL;
              }
            });
            life[i]--;
          }
        } else if(t===FIRE){
          forEachNeighbor8(x,y,(nx,ny,j)=>{
            const nt = grid[j];
            if(flammable(nt) && Math.random()<0.22){
              ignite(j, nt);
            } else if((nt===WATER || nt===ACID) && Math.random()<0.6){
              grid[i]=SMOKE; life[i]=INFO[SMOKE].life;
            } else if(nt===GUNPOWDER && Math.random()<0.5){
              explode(nx,ny,3);
            }
          });
          if(grid[i]===FIRE){
            life[i]--;
            if(life[i]<=0){
              if(Math.random()<0.65){ grid[i]=SMOKE; life[i]=INFO[SMOKE].life; }
              else { grid[i]=EMPTY; life[i]=0; }
            }
          }
        } else if(t===ACID){
          forEachNeighbor4(x,y,(nx,ny,j)=>{
            const nt = grid[j];
            if(nt===EMPTY || nt===ACID) return;
            const chance = (INFO[nt] && INFO[nt].cat==='solid') ? 0.02 : 0.06;
            if(Math.random() < chance){
              grid[j]=EMPTY; life[j]=0;
              if(!life[i]) life[i]=INFO[ACID].uses;
              life[i]--;
              if(life[i]<=0){ grid[i]=EMPTY; }
            }
          });
        } else if(t===SMOKE || t===STEAM){
          life[i]--;
          if(life[i]<=0){
            if(t===STEAM && Math.random()<0.25){ grid[i]=WATER; }
            else { grid[i]=EMPTY; }
          }
        } else if(t===TNT){
          let touchingHeat = false;
          forEachNeighbor8(x,y,(nx,ny,j)=>{ if(grid[j]===FIRE || grid[j]===LAVA) touchingHeat = true; });
          if(touchingHeat && Math.random()<0.5){ explode(x,y,6); }
        } else if(t===DYNAMITE){
          let touchingHeat = false;
          forEachNeighbor8(x,y,(nx,ny,j)=>{ if(grid[j]===FIRE || grid[j]===LAVA) touchingHeat = true; });
          if(touchingHeat && Math.random()<0.6){
            explode(x,y,4);
          } else {
            // deteksi "benturan keras": hitung berapa tick jatuh bebas berturut-turut;
            // begitu mendarat/berhenti, kalau sempat jatuh cukup jauh -> meledak
            const belowJ = (y+1<rows) ? idx(x,y+1) : -1;
            const fallingFree = belowJ!==-1 && grid[belowJ]===EMPTY && !rigidMask[belowJ];
            if(fallingFree){
              life[i] = Math.min(255, life[i]+1);
            } else {
              if(life[i] >= 7){ explode(x,y,4); }
              life[i] = 0;
            }
          }
        } else if(t===HYDROGEN){
          let boom = false;
          forEachNeighbor8(x,y,(nx,ny,j)=>{ if(grid[j]===FIRE || grid[j]===LAVA) boom = true; });
          if(boom){ explode(x,y,2); }
          else { life[i]--; if(life[i]<=0) grid[i]=EMPTY; }
        } else if(t===OXYGEN){
          forEachNeighbor8(x,y,(nx,ny,j)=>{ if(grid[j]===FIRE && Math.random()<0.3) life[j]=INFO[FIRE].life; });
          life[i]--; if(life[i]<=0) grid[i]=EMPTY;
        } else if(t===CEMENT){
          forEachNeighbor8(x,y,(nx,ny,j)=>{
            if(grid[j]===WATER && Math.random()<0.15){ grid[i]=CONCRETE; life[i]=0; grid[j]=EMPTY; }
          });
        } else if(t===IRON){
          forEachNeighbor8(x,y,(nx,ny,j)=>{
            if((grid[j]===WATER||grid[j]===ACID) && Math.random()<0.01){ grid[i]=RUST; life[i]=0; }
          });
        } else if(t===CHOCOLATE){
          let melt=false;
          forEachNeighbor8(x,y,(nx,ny,j)=>{ if(grid[j]===FIRE || grid[j]===LAVA) melt=true; });
          if(melt && Math.random()<0.3){ grid[i]=CHOCOLATE_MELT; life[i]=0; }
        } else if(t===VOID){
          forEachNeighbor8(x,y,(nx,ny,j)=>{
            if(grid[j]!==VOID && grid[j]!==EMPTY){ grid[j]=EMPTY; life[j]=0; }
          });
        } else if(t===PLANT){
          const isBurning = tickBurning(i,x,y);
          const growChance = 0.012;
          if(!isBurning && grid[i]===PLANT && Math.random() < growChance){
            let nearWater=false;
            forEachNeighbor8(x,y,(nx,ny,j)=>{ if(grid[j]===WATER) nearWater=true; });
            if(nearWater){
              const dirs=[[0,-1],[-1,0],[1,0],[-1,-1],[1,-1]];
              const [ddx,ddy] = dirs[Math.floor(Math.random()*dirs.length)];
              const nx=x+ddx, ny=y+ddy;
              if(inb(nx,ny) && grid[idx(nx,ny)]===EMPTY){
                const belowJ = (ny+1<rows) ? idx(nx,ny+1) : -1;
                const support = belowJ>=0 ? grid[belowJ] : -1;
                if(belowJ===-1 || support!==EMPTY){
                  // di atas Tanah tumbuh lebih rimbun (kadang tumbuh 2 arah sekaligus)
                  grid[idx(nx,ny)] = PLANT;
                  if(support===DIRT && Math.random()<0.4){
                    const [edx,edy] = dirs[Math.floor(Math.random()*dirs.length)];
                    const ex=nx+edx, ey=ny+edy;
                    if(inb(ex,ey) && grid[idx(ex,ey)]===EMPTY) grid[idx(ex,ey)]=PLANT;
                  }
                }
              }
            }
          }
        } else if(t===ICE || t===SNOW){
          let melt=false;
          forEachNeighbor8(x,y,(nx,ny,j)=>{ if(grid[j]===FIRE || grid[j]===LAVA) melt=true; });
          if(melt && Math.random()<0.3){ grid[i]=WATER; life[i]=0; }
        } else if(flammable(t) && isSolidOrPowder(t)){
          // catch-all: elemen padat/serbuk mudah terbakar apa pun (Kayu, Kain, Kertas,
          // Rumput, Arang, dst) — jadi nambah elemen baru gak perlu nulis reaksi ini lagi
          tickBurning(i,x,y);
        } else if(INFO[t].cat==='gas' && INFO[t].life){
          // catch-all: gas apa pun yang punya durasi hidup (Plasma, Radiasi, Klorin,
          // Neon, Listrik, dst) otomatis meluruh & habis kalau gak ditangani reaksi khusus
          life[i]--;
          if(life[i]<=0){ grid[i]=EMPTY; life[i]=0; }
        }
      }
    }
  }

  // ---------- Perpindahan (gravitasi, cairan, gas) ----------
  function tryMove(i,j,moverType){
    if(rigidMask[j]) return false; // terhalang benda fisika (rigid body)
    const targetType = grid[j];
    if(targetType===EMPTY){
      grid[j]=grid[i]; life[j]=life[i]; shade[j]=shade[i];
      grid[i]=EMPTY; life[i]=0;
      updated[i]=1; updated[j]=1;
      return true;
    }
    if(targetType===SMOKE || targetType===STEAM){
      grid[j]=grid[i]; life[j]=life[i]; shade[j]=shade[i];
      grid[i]=EMPTY; life[i]=0;
      updated[i]=1; updated[j]=1;
      return true;
    }
    if(isLiquid(targetType) && density(targetType) < density(moverType)){
      const gt=grid[j], lt=life[j], st=shade[j];
      grid[j]=grid[i]; life[j]=life[i]; shade[j]=shade[i];
      grid[i]=gt; life[i]=lt; shade[i]=st;
      updated[i]=1; updated[j]=1;
      // beri kesempatan cairan yang terdesak buat kabur ke samping (kalau ada ruang),
      // supaya tidak cuma numpuk lurus ke atas terus-menerus
      const xi = i % cols, yi = (i / cols) | 0;
      const sideDir = Math.random()<0.5 ? -1 : 1;
      const six = xi + sideDir;
      if(inb(six, yi) && grid[idx(six,yi)]===EMPTY){
        const sj = idx(six, yi);
        grid[sj]=grid[i]; life[sj]=life[i]; shade[sj]=shade[i];
        grid[i]=EMPTY; life[i]=0; shade[i]=0;
        updated[sj]=1;
      }
      return true;
    }
    return false;
  }

  function updatePowder(x,y,i,t){
    if(y+1<rows){
      const below = idx(x,y+1);
      if(tryMove(i,below,t)) return;
      const leftFirst = Math.random()<0.5;
      const dx1 = leftFirst?-1:1, dx2=-dx1;
      if(inb(x+dx1,y+1)){ const j=idx(x+dx1,y+1); if(tryMove(i,j,t)) return; }
      if(inb(x+dx2,y+1)){ const j=idx(x+dx2,y+1); if(tryMove(i,j,t)) return; }
    }
    updated[i]=1;
  }

  function updateLiquid(x,y,i,t){
    if(y+1<rows){
      const below = idx(x,y+1);
      if(tryMove(i,below,t)) return;
      const leftFirst = Math.random()<0.5;
      const dx1 = leftFirst?-1:1, dx2=-dx1;
      if(inb(x+dx1,y+1)){ const j=idx(x+dx1,y+1); if(tryMove(i,j,t)) return; }
      if(inb(x+dx2,y+1)){ const j=idx(x+dx2,y+1); if(tryMove(i,j,t)) return; }
    }
    // apung: naik jika di atas ada cairan lebih padat
    if(y-1>=0){
      const ai = idx(x,y-1);
      const at = grid[ai];
      if(isLiquid(at) && density(at) > density(t)){
        const gt=grid[ai], lt=life[ai], st=shade[ai];
        grid[ai]=grid[i]; life[ai]=life[i]; shade[ai]=shade[i];
        grid[i]=gt; life[i]=lt; shade[i]=st;
        updated[i]=1; updated[ai]=1;
        return;
      }
    }
    // menyebar horizontal: cek arah mana yang lebih lapang, tapi bergerak 1 sel per tick
    // supaya terlihat mengalir bertahap, bukan langsung "lompat" ke ujung
    const disp = INFO[t].disperse || 3;
    let dir = Math.random()<0.5 ? 1 : -1;
    let spaceDir = 0;
    for(let s=1; s<=disp; s++){
      const nx = x+dir*s;
      if(isOpen(nx,y)) spaceDir = s; else break;
    }
    const other = -dir;
    let spaceOther = 0;
    for(let s=1; s<=disp; s++){
      const nx = x+other*s;
      if(isOpen(nx,y)) spaceOther = s; else break;
    }
    if(spaceOther > spaceDir) dir = other;
    const nx = x+dir;
    if(isOpen(nx,y)){ tryMove(i, idx(nx,y), t); return; }
    updated[i]=1;
  }

  function shuffleDirs(arr){
    for(let k=arr.length-1;k>0;k--){
      const j=(Math.random()*(k+1))|0;
      const tmp=arr[k]; arr[k]=arr[j]; arr[j]=tmp;
    }
    return arr;
  }

  // Gerakan gas (api/asap/uap): naik dengan bobot acak + goyangan ke samping,
  // sesekali diam sejenak (flicker), supaya tidak terlihat seperti kolom lurus.
  function updateRisingGas(x,y,i,t){
    if(Math.random() < 0.15){ updated[i]=1; return; } // flicker: diam sesaat

    const r = Math.random();
    let dx, dy;
    if(r < 0.42)      { dx=0;  dy=-1; }
    else if(r < 0.64) { dx=-1; dy=-1; }
    else if(r < 0.86) { dx=1;  dy=-1; }
    else if(r < 0.93) { dx=-1; dy=0;  }
    else              { dx=1;  dy=0;  }

    let nx=x+dx, ny=y+dy;
    if(isOpen(nx,ny)){ tryMove(i, idx(nx,ny), t); return; }

    const alt = shuffleDirs([[0,-1],[-1,-1],[1,-1],[-1,0],[1,0]]);
    for(const [adx,ady] of alt){
      nx=x+adx; ny=y+ady;
      if(isOpen(nx,ny)){ tryMove(i, idx(nx,ny), t); return; }
    }
    updated[i]=1;
  }

  // Melayang diam di tempat lalu menyebar RATA ke segala arah (tanpa bias naik/turun/
  // samping) — dipakai untuk Plasma/Radiasi, beda dari asap/uap yang cenderung naik.
  function updateDiffusingGas(x,y,i,t){
    if(Math.random() < 0.35){ updated[i]=1; return; } // lebih sering diam biar kesan "melayang"

    const dirs = shuffleDirs([[0,-1],[0,1],[-1,0],[1,0],[-1,-1],[1,-1],[-1,1],[1,1]]);
    for(const [dx,dy] of dirs){
      const nx=x+dx, ny=y+dy;
      if(isOpen(nx,ny)){ tryMove(i, idx(nx,ny), t); return; }
    }
    updated[i]=1;
  }

  function movementPass(){
    updated.fill(0);
    for(let y=rows-1; y>=0; y--){
      const scanLeft = Math.random()<0.5;
      if(scanLeft){
        for(let x=0;x<cols;x++) processCell(x,y);
      } else {
        for(let x=cols-1;x>=0;x--) processCell(x,y);
      }
    }
  }

  function processCell(x,y){
    const i = idx(x,y);
    if(updated[i]) return;
    const t = grid[i];
    if(t===EMPTY) return;
    const info = INFO[t];
    switch(info.cat){
      case 'powder': updatePowder(x,y,i,t); break;
      case 'liquid': updateLiquid(x,y,i,t); break;
      case 'gas': (info.diffuse ? updateDiffusingGas : updateRisingGas)(x,y,i,t); break;
      // 'solid' & lainnya: statis, kalaupun ada perilaku khusus ditangani di reactionPass
    }
  }

  // ---------- Render ----------
  function render(){
    for(let p=0, n=cols*rows; p<n; p++){
      const t = grid[p];
      const o = p*4;
      if(t===EMPTY){
        buf[o]=0; buf[o+1]=0; buf[o+2]=0; buf[o+3]=0; // transparan, background statis kelihatan
        continue;
      }
      const info = INFO[t];
      let [r,g,b] = info.color;
      const sh = shade[p];
      if(sh){
        r = Math.max(0,Math.min(255, r+sh*10));
        g = Math.max(0,Math.min(255, g+sh*10));
        b = Math.max(0,Math.min(255, b+sh*10));
      }
      if(t===METAL && life[p]>0){
        const f = Math.min(1, life[p]/HEAT_MAX) * 0.7;
        r = r + (255-r)*f;
        g = g + (90-g)*f;
        b = b + (20-b)*f;
      }
      if((t===WOOD || t===PLANT) && life[p]>0){
        const f = Math.min(1, life[p]/BURN_TIME) * 0.75;
        r = r + (255-r)*f;
        g = g + (80-g)*f;
        b = b + (15-b)*f;
      }
      buf[o]=r; buf[o+1]=g; buf[o+2]=b; buf[o+3]=255;
    }
    if(heldCells && heldX!==null){
      for(const c of heldCells){
        const x = heldX+c.dx, y = heldY+c.dy;
        if(!inb(x,y)) continue;
        const [r,g,b] = cellColor(c.t, c.s);
        const o = idx(x,y)*4;
        buf[o]=r; buf[o+1]=g; buf[o+2]=b; buf[o+3]=255;
      }
    }
    function bodyCellColor(c){
      let [r,g,b] = cellColor(c.t, c.s);
      if(c.l>0 && flammable(c.t) && isSolidOrPowder(c.t)){
        const f = Math.min(1, c.l/BURN_TIME) * 0.75;
        r = r + (255-r)*f; g = g + (80-g)*f; b = b + (15-b)*f;
      } else if(c.t===METAL && c.l>0){
        const f = Math.min(1, c.l/HEAT_MAX) * 0.7;
        r = r + (255-r)*f; g = g + (90-g)*f; b = b + (20-b)*f;
      }
      return [r,g,b];
    }
    for(const b of rigidBodies){
      const bx = Math.round(b.bx), by = Math.round(b.by);
      for(const c of b.cells){
        const x = bx+c.dx, y = by+c.dy;
        if(!inb(x,y)) continue;
        const [r,g,bl] = bodyCellColor(c);
        const o = idx(x,y)*4;
        buf[o]=r; buf[o+1]=g; buf[o+2]=bl; buf[o+3]=255;
      }
    }
    if(heldBody){
      const bx = Math.round(heldBody.bx), by = Math.round(heldBody.by);
      for(const c of heldBody.cells){
        const x = bx+c.dx, y = by+c.dy;
        if(!inb(x,y)) continue;
        const [r,g,bl] = bodyCellColor(c);
        const o = idx(x,y)*4;
        buf[o]=r; buf[o+1]=g; buf[o+2]=bl; buf[o+3]=255;
      }
    }
    octx.clearRect(0,0,cols,rows);
    octx.putImageData(imgData, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(off, 0, 0, cols, rows, 0, 0, canvas.width, canvas.height);
    if(interactionMode==='physics' && boxStart && boxCur){
      const scale = canvas.width/cols;
      const minX = Math.min(boxStart[0],boxCur[0]), maxX = Math.max(boxStart[0],boxCur[0]);
      const minY = Math.min(boxStart[1],boxCur[1]), maxY = Math.max(boxStart[1],boxCur[1]);
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = Math.max(1, DPR*1.5);
      ctx.setLineDash([DPR*4, DPR*3]);
      ctx.strokeRect(minX*scale, minY*scale, (maxX-minX+1)*scale, (maxY-minY+1)*scale);
      ctx.setLineDash([]);
    }
  }

  // ---------- Loop simulasi (fixed timestep) ----------
  const STEP_MS = 1000/30;
  let acc = 0, lastT = 0, paused = false;

  function loop(t){
    if(!lastT) lastT = t;
    let dt = t - lastT;
    lastT = t;
    if(dt > 100) dt = 100;
    if(!paused && netRole !== 'guest'){
      acc += dt;
      while(acc >= STEP_MS){
        rebuildRigidMask();
        reactionPass();
        movementPass();
        updateRigidBodies();
        updateBodyMaterials();
        acc -= STEP_MS;
        netTickCounter++;
        if(netRole==='host' && netConnected && netTickCounter % 4 === 0){
          sendSnapshot();
        }
      }
    }
    render();
    requestAnimationFrame(loop);
  }

  // ---------- Input menggambar ----------
  let currentElement = SAND;
  let brushRadius = 3;
  let drawing = false;
  let interactionMode = 'paint';
  let boxStart = null, boxCur = null;

  function paintAt(cx, cy){
    const stampInfo = INFO[currentElement];
    if(stampInfo.fixedStamp){
      const [sw, sh] = stampInfo.fixedStamp;
      const ox = Math.floor((sw-1)/2), oy = Math.floor((sh-1)/2);
      for(let dy=0; dy<sh; dy++){
        for(let dx=0; dx<sw; dx++){
          const x = cx-ox+dx, y = cy-oy+dy;
          if(!inb(x,y)) continue;
          const i = idx(x,y);
          grid[i] = currentElement;
          life[i] = 0;
          shade[i] = 0;
        }
      }
      return;
    }
    const r = brushRadius;
    for(let dy=-r; dy<=r; dy++){
      for(let dx=-r; dx<=r; dx++){
        if(dx*dx+dy*dy > r*r+1) continue;
        const x = cx+dx, y = cy+dy;
        if(!inb(x,y)) continue;
        const i = idx(x,y);
        grid[i] = currentElement;
        life[i] = INFO[currentElement].life || (currentElement===ACID ? INFO[ACID].uses : 0);
        const sl = INFO[currentElement].shadeLevels;
        shade[i] = sl ? sl[Math.floor(Math.random()*sl.length)] : (Math.floor(Math.random()*5) - 2);
      }
    }
  }

  // ---------- Geser elemen yang sudah ada ----------
  // Elemen yang diambil "diangkat" keluar dari grid simulasi (jadi fisika lain tetap
  // jalan normal tanpa bisa menimpa/mengisi ulang bekasnya), lalu ditaruh kembali ke
  // posisi terakhir begitu jari dilepas — meniru cara kerja tool Drag di Sandboxels.
  function pickUp(cx, cy){
    const r = brushRadius;
    const cells = [];
    for(let dy=-r; dy<=r; dy++){
      for(let dx=-r; dx<=r; dx++){
        if(dx*dx+dy*dy > r*r+1) continue;
        const x = cx+dx, y = cy+dy;
        if(!inb(x,y)) continue;
        const i = idx(x,y);
        if(grid[i]===EMPTY) continue; // cuma ambil yang beneran ada isinya
        cells.push({ dx, dy, t:grid[i], l:life[i], s:shade[i] });
        grid[i] = EMPTY; life[i] = 0; shade[i] = 0;
      }
    }
    return cells;
  }
  function dropAt(cx, cy, cells){
    for(const c of cells){
      const x = cx+c.dx, y = cy+c.dy;
      if(!inb(x,y)) continue;
      const i = idx(x,y);
      grid[i] = c.t; life[i] = c.l; shade[i] = c.s;
    }
  }
  function cellColor(t, sh){
    const info = INFO[t];
    let [r,g,b] = info.color;
    if(sh){
      r = Math.max(0,Math.min(255, r+sh*10));
      g = Math.max(0,Math.min(255, g+sh*10));
      b = Math.max(0,Math.min(255, b+sh*10));
    }
    return [r,g,b];
  }

  function paintLine(x0, y0, x1, y1){
    const dx = x1-x0, dy = y1-y0;
    const steps = Math.max(Math.abs(dx), Math.abs(dy), 1);
    for(let s=0; s<=steps; s++){
      const x = Math.round(x0 + dx*s/steps);
      const y = Math.round(y0 + dy*s/steps);
      paintAt(x,y);
    }
  }
  function clientToCell(clientX, clientY){
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((clientX - rect.left) / rect.width * cols);
    const y = Math.floor((clientY - rect.top) / rect.height * rows);
    return [x,y];
  }

  function getPoint(e){
    if(e.touches && e.touches.length) return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    if(e.changedTouches && e.changedTouches.length) return { clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY };
    return { clientX: e.clientX, clientY: e.clientY };
  }

  let lastCellX = null, lastCellY = null;
  let heldCells = null, heldX = null, heldY = null;
  let heldGrabDX = 0, heldGrabDY = 0;

  function makeBodyFromBox(x0,y0,x1,y1){
    const minX = Math.min(x0,x1), maxX = Math.max(x0,x1);
    const minY = Math.min(y0,y1), maxY = Math.max(y0,y1);
    const cells = [];
    for(let y=minY; y<=maxY; y++){
      for(let x=minX; x<=maxX; x++){
        if(!inb(x,y)) continue;
        const i = idx(x,y);
        if(grid[i]===EMPTY) continue;
        cells.push({ dx:x-minX, dy:y-minY, t:grid[i], l:life[i], s:shade[i] });
        grid[i]=EMPTY; life[i]=0; shade[i]=0;
      }
    }
    if(cells.length===0) return null;
    return { cells, bx:minX, by:minY, vx:0, vy:0, w:(maxX-minX+1), h:(maxY-minY+1) };
  }

  function startDraw(e){
    drawing = true;
    const p = getPoint(e);
    const [x,y] = clientToCell(p.clientX, p.clientY);
    if(netRole==='guest'){
      lastCellX = x; lastCellY = y;
      sendNet({t:'in', a:'start', x, y, el:currentElement, br:brushRadius});
      hideHint();
      e.preventDefault();
      return;
    }
    if(interactionMode==='drag'){
      const body = findBodyAt(x,y);
      if(body){
        rigidBodies.splice(rigidBodies.indexOf(body),1);
        heldBody = body;
        heldGrabDX = x - Math.round(body.bx);
        heldGrabDY = y - Math.round(body.by);
      } else {
        heldCells = pickUp(x,y);
        heldX = x; heldY = y;
      }
    } else if(interactionMode==='physics'){
      boxStart = [x,y]; boxCur = [x,y];
    } else {
      lastCellX = x; lastCellY = y;
      paintAt(x,y);
    }
    hideHint();
    e.preventDefault();
  }
  function moveDraw(e){
    if(!drawing) return;
    const p = getPoint(e);
    const [x,y] = clientToCell(p.clientX, p.clientY);
    if(netRole==='guest'){
      sendNet({t:'in', a:'move', x0:lastCellX, y0:lastCellY, x, y, el:currentElement, br:brushRadius});
      lastCellX = x; lastCellY = y;
      e.preventDefault();
      return;
    }
    if(interactionMode==='drag'){
      if(heldBody){
        const nbx = x - heldGrabDX, nby = y - heldGrabDY;
        const prevBx = heldBody.bx, prevBy = heldBody.by;
        moveHeldBodyTo(heldBody, nbx, nby);
        heldBody.vx = heldBody.bx - prevBx;
        heldBody.vy = heldBody.by - prevBy;
      } else if(heldCells){
        heldX = x; heldY = y;
      }
    } else if(interactionMode==='physics'){
      boxCur = [x,y];
    } else {
      if(lastCellX===null){ paintAt(x,y); } else { paintLine(lastCellX,lastCellY,x,y); }
      lastCellX = x; lastCellY = y;
    }
    e.preventDefault();
  }
  function stopDraw(){
    if(netRole==='guest'){
      drawing = false; lastCellX = null; lastCellY = null;
      return;
    }
    if(interactionMode==='drag'){
      if(heldBody){
        rigidBodies.push(heldBody);
        heldBody = null;
      } else if(heldCells && heldX!==null){
        dropAt(heldX, heldY, heldCells);
      }
    } else if(interactionMode==='physics'){
      if(boxStart && boxCur){
        const body = makeBodyFromBox(boxStart[0],boxStart[1],boxCur[0],boxCur[1]);
        if(body) rigidBodies.push(body);
      }
      boxStart = null; boxCur = null;
    }
    drawing = false;
    lastCellX = null; lastCellY = null;
    heldCells = null; heldX = null; heldY = null;
  }

  // Sentuhan (mobile)
  canvas.addEventListener("touchstart", startDraw, { passive:false });
  canvas.addEventListener("touchmove", moveDraw, { passive:false });
  canvas.addEventListener("touchend", stopDraw, { passive:false });
  canvas.addEventListener("touchcancel", stopDraw, { passive:false });
  canvas.addEventListener("contextmenu", (e)=>e.preventDefault());

  // Mouse (desktop / fallback)
  canvas.addEventListener("mousedown", startDraw);
  window.addEventListener("mousemove", moveDraw);
  window.addEventListener("mouseup", stopDraw);

  let hintVisible = true;
  function hideHint(){
    if(!hintVisible) return;
    hintVisible = false;
    const h = document.getElementById("hint");
    h.style.opacity = "0";
  }

  // ---------- UI: kategori & tombol elemen ----------
  const elementsRow = document.getElementById("elementsRow");
  const categoryRow = document.getElementById("categoryRow");

  // Kelompokkan semua elemen (selain Hapus) berdasarkan field `group`-nya
  const elementsByGroup = {};
  for(const idStr in INFO){
    const id = Number(idStr);
    if(id === EMPTY) continue;
    const g = INFO[id].group || "Lainnya";
    if(!elementsByGroup[g]) elementsByGroup[g] = [];
    elementsByGroup[g].push(id);
  }

  function makeElBtn(t){
    const info = INFO[t];
    const btn = document.createElement("button");
    btn.className = "elBtn" + (t===currentElement ? " active" : "");
    btn.style.setProperty("--glow", info.glow || "rgba(255,255,255,.4)");
    btn.dataset.el = t;
    const dot = document.createElement("div");
    dot.className = "dot";
    dot.style.background = t===EMPTY
      ? "repeating-conic-gradient(#2a2a2e 0% 25%, #1a1a1d 0% 50%) 50% / 10px 10px"
      : `rgb(${info.color[0]},${info.color[1]},${info.color[2]})`;
    const label = document.createElement("span");
    label.textContent = info.name;
    btn.appendChild(dot);
    btn.appendChild(label);
    btn.addEventListener("click", ()=>{
      currentElement = t;
      document.querySelectorAll(".elBtn").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
    });
    return btn;
  }

  function renderElementsForGroup(group){
    elementsRow.innerHTML = "";
    if(group === "Mesin"){
      const msg = document.createElement("div");
      msg.className = "comingSoon";
      msg.textContent = "Coming Soon";
      elementsRow.appendChild(msg);
      return;
    }
    elementsRow.appendChild(makeElBtn(EMPTY)); // Hapus selalu tampil di semua kategori
    (elementsByGroup[group] || []).forEach(id => elementsRow.appendChild(makeElBtn(id)));
  }

  CATEGORY_ORDER.forEach((group, i)=>{
    const btn = document.createElement("button");
    btn.className = "catBtn" + (i===0 ? " active" : "");
    btn.textContent = group;
    btn.addEventListener("click", ()=>{
      document.querySelectorAll(".catBtn").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      renderElementsForGroup(group);
    });
    categoryRow.appendChild(btn);
  });
  renderElementsForGroup(CATEGORY_ORDER[0]);

  // ---------- UI: menu hamburger (drawer pengaturan) ----------
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const drawer = document.getElementById("drawer");
  const drawerOverlay = document.getElementById("drawerOverlay");
  function openDrawer(){ drawer.classList.add("open"); drawerOverlay.classList.add("open"); }
  function closeDrawer(){ drawer.classList.remove("open"); drawerOverlay.classList.remove("open"); }
  hamburgerBtn.addEventListener("click", openDrawer);
  drawerOverlay.addEventListener("click", closeDrawer);

  // ---------- UI: mode gambar / geser / fisika ----------
  const HINTS = {
    paint: "Sentuh & geser untuk menggambar",
    drag: "Sentuh & geser untuk memindahkan elemen",
    physics: "Kotak-kan area untuk jadi benda fisika utuh",
  };
  document.querySelectorAll(".modeBtn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      document.querySelectorAll(".modeBtn").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      interactionMode = btn.dataset.mode;
      const h = document.getElementById("hint");
      if(hintVisible){
        h.textContent = HINTS[interactionMode] || HINTS.paint;
      }
    });
  });

  // ---------- UI: kuas, jeda, bersihkan ----------
  document.querySelectorAll(".sizeBtn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      document.querySelectorAll(".sizeBtn").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      CELL = parseInt(btn.dataset.cell, 10);
      setupGrid();
    });
  });

  const BRUSH_SIZES = [1, 3, 6];
  let brushIdx = 1; // default "Sedang" (3), biar sama seperti sebelumnya
  const brushBtn = document.getElementById("brushBtn");
  brushBtn.textContent = String(BRUSH_SIZES[brushIdx]);
  brushBtn.addEventListener("click", ()=>{
    brushIdx = (brushIdx+1) % BRUSH_SIZES.length;
    brushRadius = BRUSH_SIZES[brushIdx];
    brushBtn.textContent = String(brushRadius);
  });

  const pauseBtn = document.getElementById("pauseBtn");
  pauseBtn.addEventListener("click", ()=>{
    paused = !paused;
    pauseBtn.textContent = paused ? "▶" : "||";
  });

  document.getElementById("clearBtn").addEventListener("click", ()=>{
    grid.fill(EMPTY);
    life.fill(0);
    shade.fill(0);
    rigidBodies = [];
    heldBody = null;
  });

  // ---------- Multiplayer (WebRTC via hotspot, tanpa server) ----------
  let netRole = null; // null | 'host' | 'guest'
  let netConnected = false;
  let netTickCounter = 0;
  let pc = null, dc = null;

  function mpSetStatus(text, ok){
    const el = document.getElementById("mpStatus");
    el.textContent = text;
    el.classList.toggle("connected", !!ok);
  }

  function waitIceComplete(conn){
    return new Promise(resolve=>{
      if(conn.iceGatheringState === "complete"){ resolve(); return; }
      function check(){
        if(conn.iceGatheringState === "complete"){
          conn.removeEventListener("icegatheringstatechange", check);
          resolve();
        }
      }
      conn.addEventListener("icegatheringstatechange", check);
    });
  }

  function bytesToBase64(bytes){
    let binary = "";
    const chunk = 0x8000;
    const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes.buffer || bytes);
    for(let i=0; i<arr.length; i+=chunk){
      binary += String.fromCharCode.apply(null, arr.subarray(i, i+chunk));
    }
    return btoa(binary);
  }
  function base64ToUint8(b64){
    const binary = atob(b64);
    const arr = new Uint8Array(binary.length);
    for(let i=0; i<binary.length; i++) arr[i] = binary.charCodeAt(i);
    return arr;
  }

  function setupDataChannelEvents(channel, role){
    channel.onopen = ()=>{
      netConnected = true;
      mpSetStatus(role==="host" ? "Terhubung dengan tamu" : "Terhubung dengan host", true);
      document.getElementById("mpDisconnectBtn").style.display = "";
    };
    channel.onclose = ()=>{
      netConnected = false;
      mpSetStatus("Koneksi terputus", false);
    };
    channel.onmessage = (ev)=>{
      let msg;
      try{ msg = JSON.parse(ev.data); } catch(e){ return; }
      handleNetMessage(msg);
    };
  }

  async function mpStartHost(){
    netRole = "host";
    pc = new RTCPeerConnection({ iceServers: [] });
    dc = pc.createDataChannel("sandbox");
    setupDataChannelEvents(dc, "host");
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    mpSetStatus("Menyiapkan kode...");
    await waitIceComplete(pc);
    document.getElementById("mpOfferOut").value = btoa(JSON.stringify(pc.localDescription));
    mpSetStatus("Menunggu tamu menyambung...");
  }

  async function mpFinishHost(answerText){
    try{
      const desc = JSON.parse(atob(answerText.trim()));
      await pc.setRemoteDescription(desc);
      mpSetStatus("Menyambungkan...");
    } catch(e){
      mpSetStatus("Kode balasan tidak valid");
    }
  }

  async function mpStartJoin(offerText){
    netRole = "guest";
    pc = new RTCPeerConnection({ iceServers: [] });
    pc.ondatachannel = (ev)=>{ dc = ev.channel; setupDataChannelEvents(dc, "guest"); };
    try{
      const desc = JSON.parse(atob(offerText.trim()));
      await pc.setRemoteDescription(desc);
    } catch(e){
      mpSetStatus("Kode Host tidak valid");
      return;
    }
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    mpSetStatus("Menyiapkan kode balasan...");
    await waitIceComplete(pc);
    document.getElementById("mpAnswerOut").value = btoa(JSON.stringify(pc.localDescription));
    mpSetStatus("Menunggu koneksi selesai...");
  }

  function sendNet(obj){
    if(dc && dc.readyState==="open"){
      try{ dc.send(JSON.stringify(obj)); } catch(e){ /* abaikan, koneksi mungkin baru putus */ }
    }
  }

  function sendSnapshot(){
    sendNet({
      t:"snap", cols, rows,
      g: bytesToBase64(grid),
      l: bytesToBase64(life),
      s: bytesToBase64(new Uint8Array(shade.buffer, shade.byteOffset, shade.byteLength)),
    });
  }

  function applyRemotePaint(el, br, fn){
    const prevEl = currentElement, prevBr = brushRadius;
    currentElement = el; brushRadius = br;
    fn();
    currentElement = prevEl; brushRadius = prevBr;
  }
  function handleGuestInput(msg){
    if(msg.a==="start") applyRemotePaint(msg.el, msg.br, ()=>paintAt(msg.x, msg.y));
    else if(msg.a==="move") applyRemotePaint(msg.el, msg.br, ()=>paintLine(msg.x0, msg.y0, msg.x, msg.y));
  }

  function handleNetMessage(msg){
    if(msg.t==="in" && netRole==="host"){
      handleGuestInput(msg);
    } else if(msg.t==="snap" && netRole==="guest"){
      if(msg.cols!==cols || msg.rows!==rows){ applyGridSize(msg.cols, msg.rows); }
      grid.set(base64ToUint8(msg.g));
      life.set(base64ToUint8(msg.l));
      shade.set(new Int8Array(base64ToUint8(msg.s).buffer));
    }
  }

  function mpDisconnect(){
    if(dc){ try{ dc.close(); }catch(e){} }
    if(pc){ try{ pc.close(); }catch(e){} }
    dc = null; pc = null; netRole = null; netConnected = false;
    mpSetStatus("Belum terhubung");
    document.getElementById("mpDisconnectBtn").style.display = "none";
  }

  function copyTextarea(id){
    const ta = document.getElementById(id);
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(ta.value).catch(()=>{ ta.select(); document.execCommand("copy"); });
    } else {
      ta.select(); document.execCommand("copy");
    }
  }

  document.getElementById("mpHostBtn").addEventListener("click", ()=>{
    document.getElementById("mpHostFlow").style.display = "";
    document.getElementById("mpJoinFlow").style.display = "none";
    mpStartHost();
  });
  document.getElementById("mpJoinBtn").addEventListener("click", ()=>{
    document.getElementById("mpJoinFlow").style.display = "";
    document.getElementById("mpHostFlow").style.display = "none";
    mpSetStatus("Tempel kode dari Host, lalu buat kode balasan");
  });
  document.getElementById("mpCopyOffer").addEventListener("click", ()=>copyTextarea("mpOfferOut"));
  document.getElementById("mpCopyAnswer").addEventListener("click", ()=>copyTextarea("mpAnswerOut"));
  document.getElementById("mpConnectHost").addEventListener("click", ()=>{
    mpFinishHost(document.getElementById("mpAnswerIn").value);
  });
  document.getElementById("mpMakeAnswer").addEventListener("click", ()=>{
    mpStartJoin(document.getElementById("mpOfferIn").value);
  });
  document.getElementById("mpDisconnectBtn").addEventListener("click", mpDisconnect);

  // ---------- Setup awal & resize ----------
  function init(){
    setupGrid();
  }
  window.addEventListener("resize", ()=>{
    if(netRole!=="guest") setupGrid();
  });
  window.addEventListener("orientationchange", ()=>{
    setTimeout(()=>{ if(netRole!=="guest") setupGrid(); }, 200);
  });

  init();
  requestAnimationFrame(loop);
})();
