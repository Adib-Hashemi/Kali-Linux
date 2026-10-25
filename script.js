/* KaliLab interactive learning experience. All terminal operations are virtual. */
(function(){
'use strict';
const root=document.documentElement, reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// Theme and mobile navigation
$('#theme').addEventListener('click',()=>{root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('kali-theme',root.dataset.theme)}catch(e){}});
$('#menuToggle').addEventListener('click',()=>{const nav=$('#navLinks'),open=nav.classList.toggle('open');$('#menuToggle').setAttribute('aria-expanded',String(open));$('#menuToggle').textContent=open?'×':'☰'});
$$('#navLinks a').forEach(a=>a.addEventListener('click',()=>{$('#navLinks').classList.remove('open');$('#menuToggle').setAttribute('aria-expanded','false');$('#menuToggle').textContent='☰'}));

// Tool explorer
const categories=[
 {id:'recon',label:'شناسایی و شبکه',items:[
  ['Nmap','N','کشف میزبان‌ها و بررسی پورت‌ها و سرویس‌های شبکه در محدوده مجاز.','درک سطح حمله و موجودی سرویس‌ها'],
  ['theHarvester','H','گردآوری داده‌های عمومی مانند دامنه‌ها و ایمیل‌های منتشرشده برای شناخت ردپای دیجیتال.','شناسایی سطح مواجهه عمومی'],
  ['Maltego','M','نمایش رابطه میان دامنه‌ها، سازمان‌ها و داده‌های عمومی به شکل گراف.','تحلیل ارتباطات و منبع داده'],
  ['Traceroute','T','نمایش تقریبی مسیر شبکه تا مقصد با استفاده از پاسخ‌های میانی.','عیب‌یابی مسیر و تأخیر شبکه']]},
 {id:'web',label:'امنیت وب',items:[
  ['Burp Suite','B','پروکسی رهگیر برای مشاهده و تحلیل درخواست‌ها و پاسخ‌های HTTP در برنامه مجاز.','آزمون دستی امنیت وب'],
  ['OWASP ZAP','Z','ابزار متن‌باز برای بررسی امنیت برنامه‌های وب و آموزش چرخه آزمون.','آزمایش برنامه‌های آزمایشگاهی'],
  ['Nikto','N','بررسی برخی پیکربندی‌ها و فایل‌های شناخته‌شده وب‌سرور؛ نتیجه نیاز به اعتبارسنجی دارد.','بازبینی پیکربندی سرور'],
  ['SQLMap','S','ابزار تخصصی ارزیابی تزریق SQL؛ فقط در محیط کنترل‌شده و با مجوز صریح.','آموزش امن‌سازی پایگاه داده']]},
 {id:'password',label:'رمز و هش',items:[
  ['John the Ripper','J','ابزار ممیزی رمز برای بررسی مقاومت هش‌ها در برابر حدس‌های آفلاین مجاز.','ممیزی سیاست رمز عبور'],
  ['Hashcat','H','ابزار بازیابی رمز از هش با پشتیبانی از روش‌ها و سخت‌افزارهای مختلف.','ارزیابی قدرت رمز در محیط مجاز'],
  ['KeePassXC','K','مدیر رمز برای تولید و نگهداری رمزهای یکتا در خزانه رمزنگاری‌شده.','بهبود بهداشت رمز عبور']]},
 {id:'wireless',label:'شبکه بی‌سیم',items:[
  ['Wifite','W','رابط خودکار برای ساده‌سازی برخی ارزیابی‌های امنیت Wi-Fi؛ عملکرد به سخت‌افزار و مجوز وابسته است.','آزمایش شبکه آزمایشگاهی خودتان'],
  ['Aircrack-ng','A','مجموعه ابزار تحلیل و ارزیابی امنیت شبکه‌های 802.11.','ممیزی تنظیمات Wi-Fi'],
  ['Kismet','K','سامانه کشف و پایش شبکه‌های بی‌سیم و ثبت مشاهدات رادیویی.','پایش و عیب‌یابی بی‌سیم']]},
 {id:'analysis',label:'تحلیل ترافیک و فارنزیک',items:[
  ['Wireshark','W','تحلیل بسته‌های شبکه و بررسی جزئیات پروتکل‌ها برای عیب‌یابی و پاسخ به رخداد.','تحلیل PCAP و عیب‌یابی'],
  ['Autopsy','A','رابط تحلیل فارنزیک دیجیتال برای بررسی تصویر دیسک و شواهد فایل‌سیستم.','بررسی شواهد با حفظ زنجیره نگهداری'],
  ['Volatility','V','چارچوب تحلیل حافظه برای بررسی داده‌های RAM و تحقیقات رخداد.','تحلیل حافظه در پاسخ به رخداد']]},
 {id:'defense',label:'دفاع و پایش',items:[
  ['Lynis','L','ممیزی امنیتی سیستم‌های Unix/Linux و ارائه پیشنهادهای سخت‌سازی.','بازبینی وضعیت میزبان'],
  ['Fail2ban','F','پایش لاگ‌ها و اعمال محدودیت موقت برای نشانی‌هایی که الگوهای مشکوک تکراری دارند.','کاهش تلاش‌های ورود تکراری'],
  ['OpenVAS / Greenbone','G','چارچوب مدیریت ارزیابی آسیب‌پذیری برای شناسایی و اولویت‌بندی ریسک‌ها.','مدیریت اصلاح‌پذیری‌ها']]}
];
const tabs=$('#tabs'),toolGrid=$('#toolGrid');
categories.forEach((cat,i)=>{const b=document.createElement('button');b.type='button';b.role='tab';b.dataset.cat=cat.id;b.setAttribute('aria-selected',i===0?'true':'false');b.textContent=cat.label;b.addEventListener('click',()=>showCategory(cat.id));tabs.appendChild(b)});
function showCategory(id){const cat=categories.find(c=>c.id===id);toolGrid.innerHTML=cat.items.map(([name,icon,desc,use])=>`<article class="tool-card glass"><div class="tool-card-top"><span class="tool-icon">${esc(icon)}</span><span class="mini-tag">${esc(cat.label)}</span></div><h3>${esc(name)}</h3><p>${esc(desc)}</p><div class="usecase"><b>کاربرد:</b> ${esc(use)}</div></article>`).join('');$$('#tabs button').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.cat===id)))}
showCategory('recon');

// Focus tool guides
const deep=[
 {name:'Wifite',code:'WIRELESS AUDIT',icon:'W',intro:'Wifite فرایند برخی آزمون‌های شبکه بی‌سیم را خودکار می‌کند. خودکارسازی جای شناخت پروتکل، تنظیمات اکسس‌پوینت و محدودیت سخت‌افزار را نمی‌گیرد.',points:['ابتدا مالکیت شبکه و محدوده آزمون را مشخص کن؛ آزمایش روی شبکه همسایه مجاز نیست.','حالت کارت شبکه، درایور و پشتیبانی مانیتور مود بر نتیجه اثر می‌گذارند.','برای دفاع، از WPA2-AES یا WPA3، رمز طولانی و غیرفعال‌کردن WPS در صورت عدم نیاز استفاده کن.'],note:'تمرین پیشنهادی: امنیت روتر خودت را با بازبینی تنظیمات مدیریتی و نوع رمزنگاری بررسی کن؛ این صفحه حمله بی‌سیم واقعی اجرا نمی‌کند.'},
 {name:'John the Ripper',code:'PASSWORD AUDITING',icon:'J',intro:'John the Ripper برای ممیزی رمزها و بررسی هش‌های مجاز استفاده می‌شود. هش رمز با رمزنگاری قابل‌بازگشت یکی نیست؛ در ممیزی باید نوع هش و شیوه ذخیره‌سازی را شناخت.',points:['از داده ساختگی یا نمونه‌ای استفاده کن که اجازه تحلیل آن را داری.','رمزهای طولانی و یکتا و استفاده از مدیر رمز، ریسک حدس‌زدن را کاهش می‌دهد.','برای سامانه‌های واقعی، الگوریتم‌های مخصوص رمز مانند Argon2id یا bcrypt و salt یکتا توصیه می‌شوند.'],note:'تمرین پیشنهادی: چند رمز فرضی را از نظر طول، یکتایی و قابل حدس بودن مقایسه کن؛ رمز واقعی خود را در وب‌سایت‌های ناشناس وارد نکن.'},
 {name:'Wireshark',code:'PACKET ANALYSIS',icon:'W',intro:'Wireshark بسته‌های ثبت‌شده را به لایه‌های پروتکل تجزیه می‌کند. این ابزار برای عیب‌یابی DNS، TCP، TLS و بررسی الگوهای ارتباطی مفید است؛ محتوای رمزنگاری‌شده معمولاً بدون کلید قابل خواندن نیست.',points:['فایل PCAP آزمایشگاهی باز کن و از ستون‌های Source، Destination، Protocol و Info شروع کن.','فیلتر نمایشی مثل <code>dns</code> یا <code>tcp</code> فقط نمایش را محدود می‌کند و بسته‌ها را حذف نمی‌کند.','محتوای ترافیک می‌تواند اطلاعات شخصی داشته باشد؛ اصل حداقل‌سازی و مجوز را رعایت کن.'],note:'تمرین پیشنهادی: یک PCAP نمونه آموزشی را باز کن و تعداد پرس‌وجوهای DNS یا مراحل برقراری اتصال TCP را بررسی کن.'},
 {name:'Nmap',code:'NETWORK DISCOVERY',icon:'N',intro:'Nmap برای کشف میزبان‌ها و شناسایی پورت‌ها و سرویس‌های در دسترس طراحی شده است. نتیجه یک مشاهده در زمان مشخص است، نه اثبات قطعی آسیب‌پذیری.',points:['محدوده و زمان اسکن را از قبل مشخص کن و فقط نشانی‌های متعلق به خودت یا آزمایشگاه را بررسی کن.','پورت باز می‌گوید سرویسی پاسخ می‌دهد؛ نسخه سرویس و پیکربندی باید جداگانه اعتبارسنجی شوند.','اسکن می‌تواند در سامانه‌های حساس هشدار ایجاد کند؛ با تیم عملیات هماهنگ باش.'],note:'تمرین پیشنهادی: در یک آزمایشگاه آفلاین، تفاوت مفهومی «میزبان در دسترس»، «پورت باز» و «سرویس شناسایی‌شده» را در گزارش یادداشت کن.'}
];
$('#deepGrid').innerHTML=deep.map(d=>`<article class="deep-card glass"><div class="deep-card-header"><span class="tool-icon">${d.icon}</span><div><h3>${d.name}</h3><p>${d.code}</p></div></div><p>${d.intro}</p><ul class="deep-list">${d.points.map(p=>`<li>${p}</li>`).join('')}</ul><div class="safe-note"><b>تمرین امن:</b> ${d.note.replace(/<[^>]*>/g,'')}</div></article>`).join('');

// Installation cards
const installs=[
 ['01','ماشین مجازی','برای شروع معمولاً گزینه‌ای مناسب است؛ از VirtualBox یا VMware استفاده کن و پیش از تغییرات مهم Snapshot بگیر.'],
 ['02','WSL2','برای یادگیری ابزارهای خط فرمان در ویندوز مناسب است؛ دسترسی سخت‌افزاری و برخی قابلیت‌های شبکه با نصب کامل متفاوت‌اند.'],
 ['03','Live USB','اجرای موقت بدون نصب روی دیسک داخلی؛ ماندگاری داده‌ها به شیوه ساخت USB و فضای persistence وابسته است.'],
 ['04','نصب مستقیم','دسترسی نزدیک‌تر به سخت‌افزار می‌دهد اما خطر پارتیشن‌بندی اشتباه و ناسازگاری درایور را در نظر بگیر.'],
 ['05','Container / Cloud','برای محیط‌های قابل بازسازی و کارهای خاص مناسب است؛ کانتینر معادل ماشین مجازی کامل یا محیط بی‌خطر به‌طور خودکار نیست.'],
 ['06','NetHunter','نسخه ویژه اندروید برای برخی سناریوهای امنیتی موبایل؛ پشتیبانی قابلیت‌ها به دستگاه و هسته وابسته است.']
];
$('#installGrid').innerHTML=installs.map(x=>`<article class="install-card glass"><span class="install-no">METHOD / ${x[0]}</span><h3>${x[1]}</h3><p>${x[2]}</p></article>`).join('');

// Virtual terminal: all filesystem actions are in-memory and never call the host shell.
const out=$('#out'),inp=$('#inp'),cwdLabel=$('#cwdLabel'),hist=[];let histIndex=0;
const fs={'/':{type:'dir'},'/home':{type:'dir'},'/home/learner':{type:'dir'},'/home/learner/README.md':{type:'file',content:'# KaliLab\nاین فایل‌سیستم مجازی است؛ تغییرات پس از بارگذاری مجدد صفحه پاک می‌شوند.\n'},'/home/learner/labs':{type:'dir'},'/home/learner/reports':{type:'dir'}};
let cwd='/home/learner';
function normalize(path,base=cwd){if(!path||path==='~')return '/home/learner';let p=path.startsWith('/')?path:(base+'/'+path);const a=[];p.split('/').forEach(part=>{if(!part||part==='.')return;if(part==='..')a.pop();else a.push(part)});return '/'+a.join('/')}
function displayPath(path){if(path==='/home/learner')return '~';if(path.startsWith('/home/learner/'))return '~/'+path.slice('/home/learner/'.length);return path}
function line(text='',cls=''){const d=document.createElement('div');if(cls)d.className=cls;d.innerHTML=text;out.appendChild(d);out.scrollTop=out.scrollHeight}
function rawLine(text='',cls=''){line(esc(text),cls)}
function ancestors(path){const parts=path.split('/').filter(Boolean);let cur='';for(let i=0;i<parts.length-1;i++){cur+='/'+parts[i];if(!fs[cur]||fs[cur].type!=='dir')return false}return true}
function childNames(path){const prefix=path==='/'?'/':path+'/';return Object.keys(fs).filter(p=>p!==path&&p.startsWith(prefix)&&!p.slice(prefix.length).includes('/')).map(p=>p.slice(prefix.length)).sort((a,b)=>a.localeCompare(b))}
function tokenize(s){const re=/(?:"([^"]*)"|'([^']*)'|(\S+))/g;const a=[];let m;while((m=re.exec(s))!==null)a.push(m[1]!==undefined?m[1]:m[2]!==undefined?m[2]:m[3]);return a}
function showFiles(path,long=false){if(!fs[path]||fs[path].type!=='dir'){rawLine('ls: مسیر پوشه پیدا نشد: '+displayPath(path),'term-red');return}const names=childNames(path);if(!names.length){rawLine('(پوشه خالی است)','term-muted');return}names.forEach(n=>{const full=normalize(n,path),isDir=fs[full].type==='dir';line((isDir?'<span class="term-blue">'+esc(n)+'/</span>':esc(n))+(long?'  <span class="term-muted">'+(isDir?'drwxr-xr-x':'-rw-r--r--')+'  learner learner</span>':''))})}
function help(){[
 ['help','نمایش راهنمای دستورها'],['pwd','نمایش مسیر فعلی'],['ls [مسیر]','فهرست فایل‌ها و پوشه‌ها'],['ls -la','فهرست همراه با جزئیات (نسخه ساده‌شده)'],['cd [مسیر]','تغییر پوشه؛ cd .. برای پوشه والد'],['mkdir [-p] نام','ساخت پوشه'],['touch نام','ساخت فایل خالی'],['echo "متن" > file.txt','نوشتن یا جایگزینی محتوای فایل'],['echo "متن" >> file.txt','افزودن متن به انتهای فایل'],['cat file.txt','نمایش محتوای فایل'],['tree [مسیر]','نمایش ساختار پوشه‌ها'],['rm نام','حذف فایل مجازی (با احتیاط)'],['clear','پاک‌کردن خروجی ترمینال'],['whoami / uname / date','اطلاعات نمایشی محیط آموزشی'],['history','نمایش دستورهای واردشده'],['reset-lab','بازسازی فایل‌های نمونه']
].forEach(([c,d])=>line('<span class="term-green">'+esc(c)+'</span>  <span class="term-muted">'+esc(d)+'</span>'))}
function tree(path,depth=0){if(depth>5)return;childNames(path).forEach(n=>{const p=normalize(n,path),dir=fs[p].type==='dir';line('&nbsp;'.repeat(depth*4)+(dir?'<span class="term-blue">'+esc(n)+'/</span>':esc(n)));if(dir)tree(p,depth+1)})}
function run(raw){const command=raw.trim();if(!command)return;line('<span class="prompt"><span class="term-green">learner@kali</span>:<span class="term-blue">'+esc(displayPath(cwd))+'</span>$ '+esc(command)+'</span>');hist.push(command);histIndex=hist.length;
if(command==='clear'){out.innerHTML='';return}if(command==='help'||command==='--help'){help();return}if(command==='pwd'){rawLine(cwd);return}if(command==='whoami'){rawLine('learner');return}if(command==='uname -a'){rawLine('Linux kali-lab 6.x-simulated #1 SMP x86_64 GNU/Linux (educational sandbox)');return}if(command==='date'){rawLine(new Date().toLocaleString());return}if(command==='neofetch'){line('<span class="term-blue">KaliLab</span>  <span class="term-muted">educational sandbox</span>');rawLine('OS: Kali-like demo environment');rawLine('Shell: simulated bash-like parser');rawLine('Filesystem: virtual /home/learner');rawLine('Host commands: disabled');return}if(command==='history'){hist.forEach((h,i)=>rawLine(String(i+1).padStart(4,' ')+'  '+h));return}if(command==='reset-lab'){Object.keys(fs).forEach(p=>{if(!['/','/home','/home/learner'].includes(p))delete fs[p]});fs['/home/learner/README.md']={type:'file',content:'# KaliLab\nاین فایل‌سیستم مجازی است؛ تغییرات پس از بارگذاری مجدد صفحه پاک می‌شوند.\n'};fs['/home/learner/labs']={type:'dir'};fs['/home/learner/reports']={type:'dir'};cwd='/home/learner';cwdLabel.textContent='~';rawLine('فایل‌های نمونه بازسازی شدند.');return}
if(command==='ls'||command==='ls -la'||command==='ls -l'||command.startsWith('ls ')){const args=tokenize(command).slice(1),long=args.includes('-la')||args.includes('-l'),pathArg=args.find(a=>!a.startsWith('-'));showFiles(pathArg?normalize(pathArg):cwd,long);return}
if(command==='cd'||command.startsWith('cd ')){const arg=tokenize(command).slice(1)[0]||'~',p=normalize(arg);if(fs[p]&&fs[p].type==='dir'){cwd=p;cwdLabel.textContent=displayPath(cwd)}else rawLine('cd: چنین پوشه‌ای وجود ندارد: '+arg,'term-red');return}
if(command==='mkdir'||command.startsWith('mkdir ')){let args=tokenize(command).slice(1),parents=args.includes('-p');args=args.filter(a=>a!=='-p');if(!args.length){rawLine('استفاده: mkdir [-p] نام‌پوشه','term-yellow');return}let failed=false;args.forEach(arg=>{const p=normalize(arg);if(fs[p]){if(!(parents&&fs[p].type==='dir')){rawLine('mkdir: وجود دارد: '+arg,'term-red');failed=true}return}if(parents){let cur='';p.split('/').filter(Boolean).forEach(part=>{cur+='/'+part;if(!fs[cur])fs[cur]={type:'dir'}})}else if(ancestors(p))fs[p]={type:'dir'};else{rawLine('mkdir: مسیر والد وجود ندارد؛ از mkdir -p استفاده کن.','term-red');failed=true}});if(!failed)rawLine('پوشه ساخته شد.','term-green');return}
if(command==='touch'||command.startsWith('touch ')){const args=tokenize(command).slice(1);if(!args.length){rawLine('استفاده: touch نام‌فایل','term-yellow');return}args.forEach(arg=>{const p=normalize(arg);if(fs[p]&&fs[p].type==='dir'){rawLine('touch: مسیر یک پوشه است: '+arg,'term-red');return}if(!ancestors(p)){rawLine('touch: پوشه والد وجود ندارد: '+arg,'term-red');return}if(!fs[p])fs[p]={type:'file',content:''}});return}
if(command==='cat'||command.startsWith('cat ')){const args=tokenize(command).slice(1);if(!args.length){rawLine('استفاده: cat نام‌فایل','term-yellow');return}args.forEach(arg=>{const p=normalize(arg);if(!fs[p])rawLine('cat: فایل پیدا نشد: '+arg,'term-red');else if(fs[p].type==='dir')rawLine('cat: مسیر پوشه است: '+arg,'term-red');else fs[p].content.split('\n').forEach(s=>rawLine(s))});return}
if(command==='tree'||command.startsWith('tree ')){const arg=tokenize(command).slice(1)[0]||'.',p=normalize(arg);if(!fs[p]||fs[p].type!=='dir'){rawLine('tree: پوشه پیدا نشد: '+arg,'term-red');return}rawLine(displayPath(p));tree(p);return}
if(command==='rm'||command.startsWith('rm ')){const args=tokenize(command).slice(1);if(!args.length){rawLine('استفاده: rm نام‌فایل (فقط فایل مجازی)','term-yellow');return}if(args.some(a=>a.startsWith('-'))){rawLine('برای ایمنی، گزینه‌های حذف بازگشتی پشتیبانی نمی‌شوند.','term-red');return}args.forEach(arg=>{const p=normalize(arg);if(!fs[p])rawLine('rm: فایل پیدا نشد: '+arg,'term-red');else if(fs[p].type==='dir')rawLine('rm: حذف پوشه پشتیبانی نمی‌شود؛ فایل‌های داخل آن را جداگانه بررسی کن.','term-red');else delete fs[p]});return}
if(command.startsWith('echo ')){const m=command.match(/^echo\s+("(?:[^"\\]|\\.)*"|'[^']*'|.*?)\s*(>>|>)\s*(\S+)\s*$/);if(m){let text=m[1];if((text.startsWith('"')&&text.endsWith('"'))||(text.startsWith("'")&&text.endsWith("'")))text=text.slice(1,-1);text=text.replace(/\\n/g,'\n').replace(/\\"/g,'"');const p=normalize(m[3]);if(fs[p]&&fs[p].type==='dir'){rawLine('echo: مقصد پوشه است','term-red');return}if(!ancestors(p)){rawLine('echo: پوشه والد وجود ندارد؛ ابتدا mkdir اجرا کن.','term-red');return}if(!fs[p])fs[p]={type:'file',content:''};fs[p].content=(m[2]==='>>'?fs[p].content:'')+text+'\n';return}rawLine(command.slice(5));return}
if(command==='demo'){rawLine('این محیط هیچ اسکن واقعی انجام نمی‌دهد.');rawLine('نمونه گزارش ساختگی برای 192.0.2.10 (محدوده مستندسازی TEST-NET):');rawLine('PORT   STATE    SERVICE');rawLine('22/tcp open     ssh (illustrative only)');rawLine('80/tcp filtered http (illustrative only)');rawLine('خروجی بالا فقط نمونه آموزشی است.','term-yellow');return}
if(command==='sudo'||command.startsWith('sudo ')||command.startsWith('nmap ')||command.startsWith('wifite')||command.startsWith('john ')||command.startsWith('wireshark')){rawLine('این ترمینال شبیه‌ساز است و ابزارهای شبکه/دسترسی مدیریتی را اجرا نمی‌کند. از آزمایشگاه مجاز و مستندات رسمی استفاده کن.','term-yellow');return}
rawLine('bash: دستور شناخته نشد: '+command,'term-red');rawLine('برای دیدن دستورهای پشتیبانی‌شده، help را وارد کن.','term-muted')}
$('#termForm').addEventListener('submit',e=>{e.preventDefault();run(inp.value);inp.value='';inp.focus()});inp.addEventListener('keydown',e=>{if(e.key==='ArrowUp'&&hist.length){histIndex=Math.max(0,histIndex-1);inp.value=hist[histIndex];e.preventDefault()}else if(e.key==='ArrowDown'&&hist.length){histIndex=Math.min(hist.length,histIndex+1);inp.value=hist[histIndex]||'';e.preventDefault()}});$('#clearTerm').addEventListener('click',()=>{out.innerHTML='';inp.focus()});
const quick=['help','ls -la','pwd','mkdir practice','tree','reset-lab'];quick.forEach(cmd=>{const b=document.createElement('button');b.type='button';b.textContent=cmd;b.addEventListener('click',()=>{run(cmd);out.scrollTop=out.scrollHeight});$('#chips').appendChild(b)});
line('<span class="term-muted">KaliLab simulated shell v1.0 — host system access disabled</span>');line('خوش آمدی! برای شروع <span class="term-green">help</span> را اجرا کن.');line('نمونه: <span class="term-blue">mkdir practice</span> سپس <span class="term-blue">cd practice</span> و <span class="term-blue">touch notes.txt</span>.');

// Multi-choice quiz with immediate visual feedback and score
const questions=[
 {q:'Kali Linux عمدتاً برای چه کاری طراحی شده است؟',a:['ویرایش ویدئو به‌صورت حرفه‌ای','ارزیابی امنیت، تست نفوذ مجاز و فارنزیک','جایگزینی همه سیستم‌عامل‌های سرور','افزایش خودکار سرعت اینترنت'],correct:1,why:'Kali مجموعه‌ای از ابزارهای تخصصی امنیت و بررسی دیجیتال را گردآوری می‌کند.'},
 {q:'کدام گزینه پیش از شروع آزمون امنیتی ضروری است؟',a:['خاموش‌کردن همه لاگ‌ها','استفاده از بیشترین سرعت اسکن','داشتن محدوده و مجوز روشن','اجرای همه ابزارها با دسترسی مدیر'],correct:2,why:'محدوده و مجوز مشخص از آسیب ناخواسته و ابهام حقوقی جلوگیری می‌کند.'},
 {q:'وظیفه اصلی Nmap چیست؟',a:['ویرایش تصویر دیسک','کشف میزبان و بررسی پورت/سرویس','مدیریت رمزهای ذخیره‌شده','رمزگشایی خودکار همه ترافیک TLS'],correct:1,why:'Nmap برای کشف شبکه و بررسی پورت‌ها و سرویس‌ها به کار می‌رود؛ نتیجه به‌تنهایی آسیب‌پذیری را ثابت نمی‌کند.'},
 {q:'Wireshark بیشتر برای چه کاری استفاده می‌شود؟',a:['ساخت پوشه در فایل‌سیستم','تحلیل بسته‌ها و پروتکل‌های شبکه','تولید کلیدهای فیزیکی','به‌روزرسانی هسته لینوکس'],correct:1,why:'Wireshark بسته‌های ثبت‌شده را برای عیب‌یابی و تحلیل پروتکل بررسی می‌کند.'},
 {q:'John the Ripper در چه حوزه‌ای شناخته شده است؟',a:['ممیزی رمز و تحلیل هش‌های مجاز','طراحی رابط وب','پایش دمای CPU','مدیریت DNS عمومی'],correct:0,why:'این ابزار برای بررسی مقاومت رمزها و ممیزی هش‌ها در محیط مجاز استفاده می‌شود.'},
 {q:'Wifite با چه حوزه‌ای مرتبط است؟',a:['تحلیل تصاویر پزشکی','آزمون خودکار برخی جنبه‌های امنیت Wi-Fi','فشرده‌سازی فایل‌های ویدئویی','مدیریت بسته‌های Debian فقط'],correct:1,why:'Wifite فرایند برخی ارزیابی‌های بی‌سیم را ساده می‌کند و باید فقط در شبکه مجاز استفاده شود.'},
 {q:'در ترمینال آموزشی این صفحه، دستور mkdir چه می‌کند؟',a:['پوشه مجازی می‌سازد','رایانه را خاموش می‌کند','به شبکه واقعی اسکن می‌فرستد','رمز عبور حساب سیستم را عوض می‌کند'],correct:0,why:'ترمینال این سایت شبیه‌ساز است؛ mkdir فقط پوشه‌ای در فایل‌سیستم مجازی می‌سازد.'},
 {q:'تفاوت اصلی هش با رمزنگاری چیست؟',a:['هیچ تفاوتی ندارند','هش معمولاً یک‌طرفه است؛ رمزنگاری با کلید برای بازیابی محتوا طراحی می‌شود','هش همیشه طول ورودی را حفظ می‌کند','رمزنگاری فقط برای فایل‌های صوتی است'],correct:1,why:'هش برای تولید اثرانگشت داده است؛ رمزنگاری با کلید می‌تواند امکان بازیابی متن اصلی را فراهم کند.'},
 {q:'اگر یک پورت باز باشد، کدام نتیجه‌گیری دقیق‌تر است؟',a:['قطعاً سامانه آسیب‌پذیر است','حتماً رمز عبور ضعیف دارد','سرویسی پاسخ می‌دهد و باید زمینه و پیکربندی بررسی شود','باید فوراً سامانه را حذف کرد'],correct:2,why:'پورت باز فقط یک مشاهده است؛ برای تعیین ریسک باید سرویس، پیکربندی و محدوده بررسی شوند.'},
 {q:'کدام روش برای شروع یادگیری Kali معمولاً امن‌تر و منعطف‌تر است؟',a:['نصب مستقیم روی رایانه اصلی بدون پشتیبان','ماشین مجازی همراه با Snapshot','آزمایش روی شبکه عمومی','غیرفعال‌کردن همه ابزارهای دفاعی'],correct:1,why:'ماشین مجازی و Snapshot کمک می‌کنند آزمایش را در محیط جدا انجام دهی و به وضعیت قبلی برگردی.'}
];


  const creatorCard = document.querySelector(".creator-card");

if (creatorCard) {
    creatorCard.style.opacity = "0";
    creatorCard.style.transform = "translateY(20px)";
    creatorCard.style.transition =
        "opacity 0.7s ease, transform 0.7s ease";

    requestAnimationFrame(() => {
        creatorCard.style.opacity = "1";
        creatorCard.style.transform = "translateY(0)";
    });
}

let qIndex=0,answers=Array(questions.length).fill(null),finished=false;const persianDigits=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
function renderQuiz(){const content=$('#quizContent'),q=questions[qIndex],picked=answers[qIndex];$('#quizProgress').textContent=`پرسش ${persianDigits(qIndex+1)} از ${persianDigits(questions.length)}`;$('#quizProgressBar').style.width=((qIndex+1)/questions.length*100)+'%';$('#quizScore').textContent=persianDigits(answers.reduce((s,a,i)=>s+(a===questions[i].correct?1:0),0));$('#quizPrev').disabled=qIndex===0;$('#quizNext').hidden=false;$('#quizNext').textContent=qIndex===questions.length-1?'دیدن نتیجه ←':'پرسش بعدی ←';$('#quizRestart').hidden=true;
content.innerHTML=`<h3 class="question-title">${persianDigits(qIndex+1)}. ${q.q}</h3><div class="answers">${q.a.map((a,i)=>`<button type="button" class="answer ${picked!==null&&i===q.correct?'correct':''} ${picked===i&&picked!==q.correct?'wrong':''}" data-answer="${i}" ${picked!==null?'disabled':''}><span class="answer-letter">${'ABCD'[i]}</span><span>${a}</span></button>`).join('')}</div>${picked===null?'':`<div class="answer-feedback ${picked===q.correct?'good':'bad'}">${picked===q.correct?'✓ پاسخ درست است.':'✕ این گزینه درست نیست.'} ${q.why}</div>`}`;
$$('#quizContent .answer').forEach(b=>b.addEventListener('click',()=>{if(answers[qIndex]!==null)return;answers[qIndex]=Number(b.dataset.answer);renderQuiz()}));}
function showResult(){finished=true;const score=answers.reduce((s,a,i)=>s+(a===questions[i].correct?1:0),0);$('#quizProgress').textContent='آزمون تکمیل شد';$('#quizProgressBar').style.width='100%';$('#quizScore').textContent=persianDigits(score);$('#quizContent').innerHTML=`<div class="result-panel"><div class="result-score">${persianDigits(score)} / ${persianDigits(questions.length)}</div><h3>${score>=8?'عالیه؛ پایه‌ها را خوب یاد گرفته‌ای!':score>=5?'خوب است؛ چند بخش را دوباره مرور کن.':'یک دور دیگر مبانی و راهنمای ابزارها را بخوان.'}</h3><p>پاسخ درست: ${persianDigits(score)} از ${persianDigits(questions.length)}. هدف، درک مفاهیم و استفاده مسئولانه از ابزارهاست.</p></div>`;$('#quizPrev').hidden=true;$('#quizNext').hidden=true;$('#quizRestart').hidden=false;}
$('#quizPrev').addEventListener('click',()=>{if(qIndex>0){qIndex--;renderQuiz()}});$('#quizNext').addEventListener('click',()=>{if(qIndex<questions.length-1){qIndex++;renderQuiz()}else showResult()});$('#quizRestart').addEventListener('click',()=>{qIndex=0;answers=Array(questions.length).fill(null);finished=false;$('#quizPrev').hidden=false;renderQuiz()});renderQuiz();

// Lightweight animated network backdrop, disabled for reduced-motion preference.
(function(){const canvas=$('#net');if(!canvas||!canvas.getContext)return;const ctx=canvas.getContext('2d');let w=0,h=0,dpr=1,nodes=[],mouse={x:-1000,y:-1000},raf=0;function resize(){dpr=Math.min(devicePixelRatio||1,2);w=innerWidth;h=innerHeight;canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);nodes=Array.from({length:Math.min(w<600?24:58,Math.round(w*h/22000))},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.22,vy:(Math.random()-.5)*.22}))}function draw(){ctx.clearRect(0,0,w,h);const style=getComputedStyle(root),col=style.getPropertyValue('--accent').trim()||'#6aa3ff';nodes.forEach((a,i)=>{if(!reduce){a.x+=a.vx;a.y+=a.vy;if(a.x<0||a.x>w)a.vx*=-1;if(a.y<0||a.y>h)a.vy*=-1}for(let j=i+1;j<nodes.length;j++){const b=nodes[j],dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy);if(d<120){ctx.strokeStyle=col;ctx.globalAlpha=(1-d/120)*.12;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}}const md=Math.hypot(a.x-mouse.x,a.y-mouse.y);if(md<145){ctx.strokeStyle=col;ctx.globalAlpha=(1-md/145)*.2;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(mouse.x,mouse.y);ctx.stroke()}ctx.globalAlpha=.35;ctx.fillStyle=col;ctx.beginPath();ctx.arc(a.x,a.y,1.5,0,Math.PI*2);ctx.fill()});ctx.globalAlpha=1;if(!reduce)raf=requestAnimationFrame(draw)}addEventListener('resize',()=>{cancelAnimationFrame(raf);resize();draw()},{passive:true});addEventListener('pointermove',e=>{mouse.x=e.clientX;mouse.y=e.clientY},{passive:true});resize();draw()})();
})();
