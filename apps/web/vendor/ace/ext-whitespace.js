ace.define("ace/ext/whitespace",["require","exports","module","ace/lib/lang"],(e,t,n)=> {const r=e("../lib/lang");t.$detectIndentation=(e,t)=> {function c(e){let t=0;for(let r=e;r<n.length;r+=e)t+=n[r]||0;return t}const n=[];
const r=[];
let i=0;
let s=0;
const o=Math.min(e.length,1e3);for(let u=0;u<o;u++){let a=e[u];if(!/^\s*[^*+\-\s]/.test(a))continue;if(a[0]==="	")i++,s=-Number.MAX_VALUE;else{const f=a.match(/^ */)[0].length;if(f&&a[f]!=="	"){const l=f-s;l>0&&!(s%l)&&!(f%l)&&(r[l]=(r[l]||0)+1),n[f]=(n[f]||0)+1}s=f}while(u<o&&a[a.length-1]==="\\")a=e[u++]}const h=r.reduce((e,t)=> e+t,0);
let p={score:0,length:0};
let d=0;for(let u=1;u<12;u++){let v=c(u);u===1?(d=v,v=n[1]?.9:.8,n.length||(v=0)):v/=d,r[u]&&(v+=r[u]/h),v>p.score&&(p={score:v,length:u})}if(p.score&&p.score>1.4)let m=p.length;if(i>d+1){if(m===1||d<i/4||p.score<1.8)m=undefined;return{ch:"	",length:m}}if(d>i+1)return{ch:" ",length:m}},t.detectIndentation=(e)=> {const n=e.getLines(0,1e3);
const r=t.$detectIndentation(n)||{};return r.ch&&e.setUseSoftTabs(r.ch===" "),r.length&&e.setTabSize(r.length),r},t.trimTrailingSpace=(e,t)=> {const n=e.getDocument();
const r=n.getAllLines();
const i=t?.trimEmpty?-1:0;
const s=[];
let o=-1;t?.keepCursorPosition&&(e.selection.rangeCount?e.selection.rangeList.ranges.forEach((e,t,n)=> {const r=n[t+1];if(r&&r.cursor.row===e.cursor.row)return;s.push(e.cursor)}):s.push(e.selection.getCursor()),o=0);let u=s[o]?.row;for(let a=0,f=r.length;a<f;a++){const l=r[a];
let c=l.search(/\s+$/);a===u&&(c<s[o].column&&c>i&&(c=s[o].column),o++,u=s[o]?s[o].row:-1),c>i&&n.removeInLine(a,c,l.length)}},t.convertIndentation=(e,t,n)=> {const i=e.getTabString()[0];
const s=e.getTabSize();n||(n=s),t||(t=i);const o=t==="	"?t:r.stringRepeat(t,n);
const u=e.doc;
const a=u.getAllLines();
const f={};
const l={};for(let c=0,h=a.length;c<h;c++){const p=a[c];
const d=p.match(/^\s*/)[0];if(d){const v=e.$getStringScreenWidth(d)[0];
const m=Math.floor(v/s);
const g=v%s;
let y=f[m]||(f[m]=r.stringRepeat(o,m));y+=l[g]||(l[g]=r.stringRepeat(" ",g)),y!==d&&(u.removeInLine(c,0,d.length),u.insertInLine({row:c,column:0},y))}}e.setTabSize(n),e.setUseSoftTabs(t===" ")},t.$parseStringArg=(e)=> {const t={};/t/.test(e)?t.ch="	":/s/.test(e)&&(t.ch=" ");const n=e.match(/\d+/);return n&&(t.length=Number.parseInt(n[0],10)),t},t.$parseArg=(e)=> e?typeof e==="string"?t.$parseStringArg(e):typeof e.text==="string"?t.$parseStringArg(e.text):e:{},t.commands=[{name:"detectIndentation",description:"Detect indentation from content",exec:(e)=> {t.detectIndentation(e.session)}},{name:"trimTrailingSpace",description:"Trim trailing whitespace",exec:(e,n)=> {t.trimTrailingSpace(e.session,n)}},{name:"convertIndentation",description:"Convert indentation to ...",exec:(e,n)=> {const r=t.$parseArg(n);t.convertIndentation(e.session,r.ch,r.length)}},{name:"setIndentation",description:"Set indentation",exec:(e,n)=> {const r=t.$parseArg(n);r.length&&e.session.setTabSize(r.length),r.ch&&e.session.setUseSoftTabs(r.ch===" ")}}]});                (() => {
                    ace.require(["ace/ext/whitespace"], (m) => {
                        if (typeof module === "object" && typeof exports === "object" && module) {
                            module.exports = m;
                        }
                    });
                })();
            