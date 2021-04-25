
canvas = document.getElementById("myCanvas");
ctx = canvas.getContext("2d");

rad=10
trunkmin=80
trunkmax=145
divmin=0.55
divmax=0.85
massmarkdown=0.7
splitang=0.25
splitangmarkup=1.125
root=0.3
cutofflen=20
leafairresist=0.05
defaultangstiff=0.03


fffff=1
grav=[0,-0.1]
floor=rad
iters=5
restitution=0.45//.45//bounce
fric=1.25//implementation is probably wrong tbh
defaultstiff=1////////////////maybe change
defaultmass=1

var keys = {};
window.onkeyup = function(e){keys[e.keyCode] = false}
window.onkeydown = function(e){keys[e.keyCode] = true}
mouseDown = 0;mx=0;my=0;held=false;
document.body.onmousedown = function(){
    rec=60
    held=false
    for (i=0;i<nodes.length;i++){
        if (Math.abs(nodes[i].x-mx)<rec && Math.abs(nodes[i].y-my)<rec){
            dist=((nodes[i].x-mx)**2+(nodes[i].y-my)**2)**0.5
            if(dist<rec){
                rec=dist
                held=i
            }
        }
    }
}
document.body.onmouseup = function(){
    held=false;
}
onmousemove = function(e){mx=e.clientX- canvas.getBoundingClientRect().left;my=canvas.height-e.clientY+ canvas.getBoundingClientRect().top}

function addnode(xx,yy,m,xv,yv,f,d,airresist, windy){
    nodes.push({x:xx,y:yy,lastx:xx-xv,lasty:yy-yv,mass:m,fixed:f,draw:d,air:airresist, wind:windy})
}
function distance(a,b){
    return ((a.x-b.x)**2+(a.y-b.y)**2)**0.5
}
function spawnbranch(a,b,m,sm,exag){
    curr=Math.atan2(nodes[b].y - nodes[a].y, nodes[b].x - nodes[a].x);
    currd=distance(nodes[a],nodes[b])/exag
    leftlen=(Math.random()*(divmax-divmin)+divmin)*currd
    rightlen=(Math.random()*(divmax-divmin)+divmin)*currd
    addnode(nodes[b].x+Math.cos(curr+splitang*sm)*leftlen,nodes[b].y+Math.sin(curr+splitang*sm)*leftlen,m*massmarkdown,0,0,false,leftlen<cutofflen,(leftlen<cutofflen?1:0)*leafairresist,false)
    addnode(nodes[b].x+Math.cos(curr-splitang*sm)*rightlen,nodes[b].y+Math.sin(curr-splitang*sm)*rightlen,m*massmarkdown,0,0,false,rightlen<cutofflen,(rightlen<cutofflen?1:0)*leafairresist,false)

    lefty=nodes.length-2
    righty=nodes.length-1

    addang(a,b,lefty,false,defaultangstiff,true)
    addang(a,b,righty,false,defaultangstiff,false)

    addlink(b,lefty,false,defaultstiff,true)
    addlink(b,righty,false,defaultstiff,true)

    store[b]=[rightlen,b,righty]
    if(leftlen>cutofflen){
        spawnbranch(b,lefty,nodes[lefty].mass,sm*splitangmarkup,1)
    }
    if(store[b][0]>cutofflen){
        spawnbranch(store[b][1],store[b][2],nodes[store[b][2]].mass,sm*splitangmarkup,1)
    }
}
function spawntree(xx){
    store={};
    trunk=Math.random()*(trunkmax-trunkmin)+trunkmin
    base=nodes.length
    addnode(xx,0,defaultmass/massmarkdown,0,0,true,false,0,false)
    addnode(xx,trunk*(0.5-root/2),defaultmass,0,0,true,false,0,false)
    addnode(xx,trunk*(1-root),defaultmass,0,0,false,false,0,true)
    addlink(base+0,base+2,false,defaultstiff,true)
    addang(base+0,base+1,base+2,Math.PI,defaultangstiff,true)
    spawnbranch(base+0,base+2,nodes[base+2].mass,1,1-root)
}
function spawn(){
    links=[];
    nodes=[];
    angs=[];

    spawntree(225)
    spawntree(575)
    spawntree(925)



}
function find_angle(Ax,Ay,Bx,By,Cx,Cy){
	var AB = Math.sqrt(Math.pow(Bx-Ax,2)	+	Math.pow(By-Ay,2));
	var BC = Math.sqrt(Math.pow(Bx-Cx,2)	+ 	Math.pow(By-Cy,2));
	var AC = Math.sqrt(Math.pow(Cx-Ax,2)	+ 	Math.pow(Cy-Ay,2));

	return Math.acos((BC*BC+AB*AB-AC*AC)	/	(2*BC*AB));
}
function addang(p1,p2,p3,ang,stiff,clockwise){
    if (ang==false){
        ang=find_angle(nodes[p1].x,nodes[p1].y,nodes[p2].x,nodes[p2].y,nodes[p3].x,nodes[p3].y)
    }
    if(!clockwise){
        ang*=-1
    }
    angs.push({a:p1,b:p2,c:p3,angle:ang,stiffness:stiff})
}
function addlink(p1,p2,d,stiff,dr){
    if (d==false){

        d=distance(nodes[p1],nodes[p2])
    }
    links.push({a:p1,b:p2,dist:d,stiffness:stiff,draw:dr})
}
function drawnode(node){

    var grd = ctx.createRadialGradient(node.x, canvas.height-node.y, rad, node.x, canvas.height-node.y, 3*rad);
    grd.addColorStop(0, 'rgba(0,100,255,0.2)');
    grd.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle=grd
    ctx.beginPath()
    //ctx.fillStyle='rgba(0,100,255,0.5)'
    ctx.arc(node.x,canvas.height-node.y,3*rad,0,3*Math.PI)
    ctx.fill()

    ctx.fillStyle='rgba(0,100,255,0.4)'
    ctx.beginPath()
    ctx.arc(node.x,canvas.height-node.y,rad,0,3*Math.PI)
    ctx.fill()



}
function drawlink(link){
    a=Math.max(nodes[link.a].mass,nodes[link.b].mass)
    ctx.lineWidth=a**0.55/0.175
    ctx.strokeStyle='rgba('+a.toString()**0.75*195.15+','+a.toString()**0.75*195.15+','+a.toString()**0.75*195.15+',1)'
    ctx.beginPath()
    ctx.lineTo(nodes[link.a].x,canvas.height-nodes[link.a].y)
    ctx.lineTo(nodes[link.b].x,canvas.height-nodes[link.b].y)
    ctx.stroke()
}
function drawang(an){
    bc=ctx.strokeStyle
    bc2=ctx.lineWidth
    ctx.lineWidth=3
    ctx.strokeStyle="Blue"

    ctx.beginPath()
    ctx.lineTo(nodes[an.a].x,canvas.height-nodes[an.a].y)
    ctx.lineTo(nodes[an.c].x,canvas.height-nodes[an.c].y)
    ctx.stroke()
    ctx.strokeStyle=bc
    ctx.lineWidth=bc2
}
function render(){
    ctx.clearRect(0,0,canvas.width,canvas.height)
    /*
    for (i=0;i<angs.length;i++){
        drawang(angs[i])
    }
    */
    if(held){
        back=[ctx.strokeStyle,ctx.lineWidth]
        ctx.strokeStyle='rgba(100,100,100,0.5)'
        ctx.lineWidth=3
        ctx.beginPath()
        ctx.lineTo(nodes[held].x,canvas.height-nodes[held].y)
        ctx.lineTo(mx,canvas.height-my)
        ctx.stroke()
        ctx.strokeStyle=back[0]
        ctx.lineWidth=back[1]
    }
    for (i=0;i<links.length;i++){
        if(links[i].draw){

            drawlink(links[i])
        }

    }
    for (i=0;i<nodes.length;i++){
        if(nodes[i].draw){

            drawnode(nodes[i])
        }
    }

    ctx.fillText(Math.round(fps), 10, 50);


}
function verlet(){
    for (i=0;i<nodes.length;i++){
        if (nodes[i].fixed==false){
            xv=nodes[i].x-nodes[i].lastx
            yv=nodes[i].y-nodes[i].lasty
            if (nodes[i].y<floor){
                 overlap=floor-nodes[i].y
                 xv/=fric**overlap
                 nodes[i].y=floor
                 if (yv<0){
                      yv*=-restitution
                 }
            }
            /*
            if (nodes[i].y>canvas.height-floor){
                 overlap=nodes[i].y-canvas.height+floor
                 xv/=fric**overlap
                 nodes[i].y=canvas.height-floor
                 if (yv>0){
                      yv*=-restitution
                 }
            }
            if (nodes[i].x<floor){
                 overlap=floor-nodes[i].x
                 yv/=fric**overlap
                 nodes[i].x=floor
                 if (xv<0){
                      xv*=-restitution
                 }
            }

            if (nodes[i].x>canvas.width-floor){
                 overlap=nodes[i].x-canvas.width+floor
                 yv/=fric**overlap
                 nodes[i].x=canvas.width-floor
                 if (xv>0){
                      xv*=-restitution
                 }
            }*/

            nodes[i].lastx=nodes[i].x
            nodes[i].lasty=nodes[i].y
            nodes[i].x=nodes[i].x+xv+grav[0]
            nodes[i].y=nodes[i].y+yv+grav[1]
            if (nodes[i].wind){
                nodes[i].x -= wind
            }


        }

    }
}
function solve(k){
    link=links[k]
    p1=nodes[link.a]
    p2=nodes[link.b]

    dx=p1.x-p2.x
    dy=p1.y-p2.y
    d=(dx**2 + dy**2)**0.5

    if (p1.fixed==false || p2.fixed==false){



        difference = (link.dist - d)/d
        if(p1.fixed==true){
            im1=0
        }else{
            im1 = 1 / p1.mass;
        }
        if(p2.fixed==true){
            im2=0
        }else{
            im2 = 1 / p2.mass;
        }
        scalarp1 = (im1 / (im1 + im2)) * link.stiffness;
        scalarp2 = link.stiffness - scalarp1;

        tx = dx*difference
        ty = dy*difference
        p1.x+=tx*scalarp1
        p1.y+=ty*scalarp1
        p2.x-=tx*scalarp2
        p2.y-=ty*scalarp2



    }

}
function solveang(ang){
    pxsum=pysum=0;
    curr=find_angle(nodes[ang.a].x,nodes[ang.a].y,nodes[ang.b].x,nodes[ang.b].y,nodes[ang.c].x,nodes[ang.c].y)
    if (nodes[ang.c].fixed!=true){
        angab = Math.atan2(nodes[ang.a].y - nodes[ang.b].y, nodes[ang.a].x - nodes[ang.b].x);
        d=distance(nodes[ang.b],nodes[ang.c])
        gx=nodes[ang.b].x + d * Math.cos(angab-ang.angle)
        gy=nodes[ang.b].y + d * Math.sin(angab-ang.angle)
        px=(nodes[ang.c].x-gx)*ang.stiffness*nodes[ang.a].mass/nodes[ang.c].mass
        py=(nodes[ang.c].y-gy)*ang.stiffness*nodes[ang.a].mass/nodes[ang.c].mass
        nodes[ang.c].x-=px
        nodes[ang.c].y-=py
        pxsum+=px*nodes[ang.c].mass
        pysum+=py*nodes[ang.c].mass
    }
    if (nodes[ang.a].fixed!=true){
        angbc = Math.atan2(nodes[ang.c].y - nodes[ang.b].y, nodes[ang.c].x - nodes[ang.b].x);
        d=distance(nodes[ang.b],nodes[ang.a])
        gx=nodes[ang.b].x + d * Math.cos(angbc+ang.angle)
        gy=nodes[ang.b].y + d * Math.sin(angbc+ang.angle)
        px=(nodes[ang.a].x-gx)*ang.stiffness*nodes[ang.c].mass/nodes[ang.a].mass
        py=(nodes[ang.a].y-gy)*ang.stiffness*nodes[ang.c].mass/nodes[ang.a].mass
        nodes[ang.a].x-=px
        nodes[ang.a].y-=py
        pxsum+=px*nodes[ang.a].mass
        pysum+=py*nodes[ang.a].mass
    }
    if (nodes[ang.b].fixed!=true){
        pxsum/=nodes[ang.b].mass
        pysum/=nodes[ang.b].mass
        nodes[ang.b].x+=pxsum
        nodes[ang.b].y+=pysum
    }
}
function update(){
    for(iter=0;iter<iters;iter++){
        for(k=0;k<links.length;k++){
            solve(k)
        }
        for(k=0;k<angs.length;k++){
            solveang(angs[k])
        }
    }
    verlet()
}
function exper(){
    if(held){
        nodes[held].x=mx
        nodes[held].y=my
    }
    for(i=0;i<nodes.length;i++){
        if (nodes[i].air>0){
            xv=nodes[i].x-nodes[i].lastx
            yv=nodes[i].y-nodes[i].lasty
            nodes[i].x-=xv*nodes[i].air
            nodes[i].y-=yv*nodes[i].air
        }
    }
}
function game(){
    for (ffff=0;ffff<fffff;ffff++){

        wind += (Math.random()-0.5)*0.1
        wind *= 0.99

        exper()//before update
        update()

        render()
    }
    //setTimeout(game,1500)
    frames++;
    requestAnimationFrame(game)
}
function fr(){
    fps=frames-lastframes
    lastframes=frames
}
function init(){
    lastframes=frames=0;

    wind = 0
    fps=60;
    ctx.strokeStyle="grey"
    ctx.fillStyle="white"
    ctx.lineWidth=6
    ctx.lineCap="round"
    ctx.font = "30px Arial";
    setInterval(fr,1000)
    spawn()
    game()
}
init()