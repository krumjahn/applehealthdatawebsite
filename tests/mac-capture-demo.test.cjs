const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const code=fs.readFileSync('js/mac-capture-demo.js','utf8');
function setup(){
 const images=[],buttons=['overview','steps','heart','sleep'].map(key=>({dataset:{macScreen:key},pressed:key==='overview',setAttribute(_,v){this.pressed=v==='true'}}));
 const screen={src:'/images/mac-demo-overview.png'},status={},link={};
 const nav={hidden:true,addEventListener(_,f){this.click=f},contains:b=>buttons.includes(b),querySelectorAll:()=>buttons};
 const root={querySelector:s=>({'#mac-demo-screen':screen,'.mac-capture-nav':nav,'.mac-capture-status':status,'.mac-capture-full':link}[s])};
 vm.runInNewContext(code,{document:{getElementById:()=>root},Image:class{constructor(){images.push(this)}}});
 return {screen,status,nav,link,images,buttons,click(i){nav.click({target:{closest:()=>buttons[i]}})}};
}
test('navigation displays only loaded exact screenshot and correct full-size link',()=>{const t=setup();assert.equal(t.nav.hidden,false);for(let r=0;r<3;r++)for(let i=0;i<4;i++){t.click(i);t.images.at(-1).onload();assert.equal(t.screen.src,`/images/mac-demo-${t.buttons[i].dataset.macScreen}.png`);assert.equal(t.link.href,t.screen.src);assert.equal(t.buttons.filter(x=>x.pressed).length,1);assert.match(t.screen.alt,/Actual Mac app/);}});
test('late screenshot never replaces latest choice',()=>{const t=setup();t.click(1);t.click(2);t.images[1].onload();t.images[0].onload();assert.equal(t.screen.src,'/images/mac-demo-heart.png');});
test('failed load retains visible screenshot and announces retry',()=>{const t=setup();t.click(3);t.images[0].onerror();assert.equal(t.screen.src,'/images/mac-demo-overview.png');assert.match(t.status.textContent,/try again/);});
test('native screenshot assets and no-script fallback exist',()=>{const html=fs.readFileSync('index.html','utf8');assert.match(html,/mac-capture-nav[^>]*hidden/);assert.match(html,/Actual Mac app Overview/);for(const key of ['overview','steps','heart','sleep'])assert.ok(fs.existsSync(`images/mac-demo-${key}.png`));});
