export type Point3 = {x:number;y:number;z:number};
const sigma=10, rho=28, beta=8/3;
function deriv(p:Point3):Point3{return {x:sigma*(p.y-p.x),y:p.x*(rho-p.z)-p.y,z:p.x*p.y-beta*p.z};}
export function rk4(p:Point3,dt:number):Point3 {const a=deriv(p), b=deriv({x:p.x+a.x*dt/2,y:p.y+a.y*dt/2,z:p.z+a.z*dt/2}),c=deriv({x:p.x+b.x*dt/2,y:p.y+b.y*dt/2,z:p.z+b.z*dt/2}),d=deriv({x:p.x+c.x*dt,y:p.y+c.y*dt,z:p.z+c.z*dt});return {x:p.x+dt*(a.x+2*b.x+2*c.x+d.x)/6,y:p.y+dt*(a.y+2*b.y+2*c.y+d.y)/6,z:p.z+dt*(a.z+2*b.z+2*c.z+d.z)/6};}
export function integrate(initial:Point3,count=1800,dt=.008):Point3[]{let p=initial;const out:Point3[]=[];for(let i=0;i<count;i++){out.push(p);p=rk4(p,dt);}return out;}
export const TRAIL_A=integrate({x:1,y:1,z:1});
export const TRAIL_B=integrate({x:1.000001,y:1,z:1});
export function distance(a:Point3,b:Point3){return Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z)}
export const ERROR=TRAIL_A.map((p,i)=>distance(p,TRAIL_B[i]));
