let $ = require('jQuery')
$(document).ready( function() {
    // plot_transmission('./data/3h2/t0.146999.csv')  
    make_slider(slider_ao,18);
    make_slider(slider_grad,18);
    make_slider(slider_angular,2);
    make_slider(slider_ao_or_mo,2)
    // add_functionality(slider_ao,update_orb_and_gradorb)
    // add_functionality(slider_grad,update_grad_and_gradorb)


let viewer1 = $3Dmol.createViewer($("#orbital"));
let viewer2 = $3Dmol.createViewer($("#gradient"));
let viewer3 = $3Dmol.createViewer($("#graddotao"));
viewer1.rotate(30,"y");
viewer2.rotate(30,"y");
viewer3.rotate(30,"y");
viewer1.rotate(10,"z");
viewer2.rotate(10,"z");
viewer3.rotate(10,"z");

const namelist = ['3h2','c2h2']
const oplist = ['ao','mo']

// let viewer4 = $3Dmol.createViewer($("#orbital_p"));
// let viewer5 = $3Dmol.createViewer($("#gradient_p"));
// let viewer6 = $3Dmol.createViewer($("#graddotao_p"));

function plot_transmission(path){
    d3.csv(path, function(error,data) {
        if (error) throw error;

        // Load data from path
        data.forEach(function(d) {
            d['t_ao'   ]  = +d['t_ao'   ];
            d['t_mo'   ]  = +d['t_mo'   ];
            d['gles_ao']  = +d['gles_ao'];
            d['gles_mo']  = +d['gles_mo'];
            d['gr_mo'  ]  = +d['gr_mo'  ];
            d['gr_ao'  ]  = +d['gr_ao'  ];
            d['eret'   ]  = +d['eret'   ];
            d['eles'   ]  = +d['eles'   ];
        });

        // Plot data
        line_plot(data,"eret","t_ao","#tag","black")
        // line_plot(data,"eret","t_mo","#tag","red")
    })
}

// plot line plot
function line_plot(data,x_val,y_val,id_tag,color){
    const margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 400 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

    const x = d3.scaleLinear().range([0, width]);
    const y = d3.scaleLog().range([height, 0]);

    const valueline = d3.line()
                        .x(function(d) { return x(d[x_val]); })
                        .y(function(d) { 
                            if (d[y] < 1e-6){
                                return y(1e-6)
                            } else{
                                return y(d[y_val]); 
                            }
                        console.log("hello2")
                        });

    const svg = d3.select(id_tag).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    x.domain(d3.extent(data, function(d) { return d[x_val]; }));
    y.domain([1e-6, 1]);    

    svg.append("path").attr("class", "line")          // Add the valueline path.
    .attr("d", valueline(data))
    .style("stroke", color)
    .style("opacity", 0.9);  

    // Add the X Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Add the Y Axis
    svg.append("g")
        .call(d3.axisLeft(y));
}


function make_slider(slider,index_numbers){
    noUiSlider.create(slider, {
        start: [0],
        connect: [true, false],
        range: {
            'min': 0,
            'max': index_numbers-1, //7
        },
        step: 1,
        pips: {
            mode: 'values',
            // values: [0, 1, 2, 3, 4, 5, 6, 7],
            values: [...Array(index_numbers).keys()],
            density: 40
        },
    });

}


let orbital_viewer = (viewer,orb_number,path) => {
    let op = oplist[slider_ao_or_mo.noUiSlider.get()|0]
    $.get(path+'/cubes/'+op+'/'+orb_number.toString()+'.cube', function(data){
    var voldata = new $3Dmol.VolumeData(data, "cube");
    viewer.addIsosurface(voldata, {isoval: 0.02,
                                    color: "blue",
                                    alpha: 0.9,
                                    smoothness: 100,
                                    // wireframe:true,
                                    linewidth:10,
                                });
    viewer.addIsosurface(voldata, {isoval: -0.02,
                                    color: "red",
                                    smoothness: 100,
                                    alpha:0.9,
                                    // wireframe:true,
                                    linewidth:10,
    //                                 // clickable:true,
    //                                 // callback:
    //                                 // function() {
    //                                 //                 this.opacity = 0.5;
    //                                                 // }
                                    }
                        );
    // viewer.setStyle({}, {stick:{}});              
    viewer.render();      
    });
}

let load_xyz = (viewer,path) => {
    $.get(path+'molecule.xyz', function(data){
    viewer.setBackgroundColor(0xffffff);    
    // var m = viewer.addAsOneMolecule(data, "xyz");
    var m = viewer.addModel(data, "xyz");
    // var m2 = viewer.addAsOneMolecule(data, "xyz");
    var m2 = viewer.addModel(data, "xyz");
    m.setStyle({},{stick:{
        radius: 0.07,
        opacity: 0.01,
    }});
    m2.setStyle({},{sphere:{
        radius: 0.2,
        opacity: 1,
    }});
    // m.vibrate(10, 1);
    //viewer.animate({loop: "backAndForth"});
    viewer.zoomTo();
    viewer.zoom(2.2);
    // viewer.translate(10,10);
    viewer.render();
    })
}


let update_graddotao = (grad_value,orb_value) => { 
    let op = oplist[slider_ao_or_mo.noUiSlider.get()|0]
    let mol = namelist[slider_angular.noUiSlider.get()|0]
    path = './data/'+mol+'/'
    viewer3.clear()
    load_xyz(viewer3,path)
    load_arrows(viewer3,path+'graddot/graddot'+op+grad_value+'_'+orb_value+'.csv')
}

let update_grad = (value) => { 
    let mol = namelist[slider_angular.noUiSlider.get()|0] 
    let op = oplist[slider_ao_or_mo.noUiSlider.get()|0]
    path = './data/'+mol+'/'
    viewer2.clear()
    load_xyz(viewer2,path)
    load_arrows(viewer2,path+'gradients/gradient_'+op+value+'.csv')

}

let update_orb = (value) => { 
    let mol = namelist[slider_angular.noUiSlider.get()|0] 
    path = './data/'+mol+'/'
    viewer1.clear()
    load_xyz(viewer1,path)
    orbital_viewer(viewer1,value,path)
}

let update_orb_and_gradorb = (ao_value) => {
    update_orb(ao_value)
    let grad_value = (slider_grad.noUiSlider.get()|0)
    update_graddotao(grad_value,ao_value)
}

let update_grad_and_gradorb = (grad_value) => {
    update_grad(grad_value)
    let ao_value = (slider_ao.noUiSlider.get()|0)
    update_graddotao(grad_value,ao_value)
}


let update_all = () => {
    let ao_value = (slider_ao.noUiSlider.get()|0)
    let grad_value = (slider_grad.noUiSlider.get()|0)
    update_orb(ao_value)
    update_grad_and_gradorb(grad_value)
}

function add_functionality(slider,callback){
    slider.noUiSlider.on('set', function(value){
        callback((value|0));
    });

    var handle = slider.querySelector('.noUi-handle');

    handle.setAttribute('tabindex', 0);

    handle.addEventListener('click', function(){
        this.focus();
    });

    handle.addEventListener('keydown', function( e ) {

        var value = Number( slider.noUiSlider.get() );

        switch ( e.which ) {
            case 37: slider.noUiSlider.set( value - 1 );
                break;
            case 39: slider.noUiSlider.set( value + 1 );
                break;
        }
    });
}


let load_arrows = (viewer,path) => {
    d3.csv(path, function(error,data) {
        if (error) throw error;
      
        data.forEach(function(d) {
            d['xs']  = +d['xs'];
            d['ys']  = +d['ys'];
            d['zs']  = +d['zs'];
            d['xe']  = +d['xe'];
            d['ye']  = +d['ye'];
            d['ze']  = +d['ze'];
            d['norm']= +d['norm'];

            arrows(viewer,d)
            
        });   
    viewer.render(); 
    });
}


let arrows = function(viewer,d){
    viewer.addArrow({start:{x:d['xs'],y:d['ys'],z:d['zs']},
                        end:{x:d['xe'],y:d['ye'],z:d['ze']},
                        radius:d['norm']*3,
                        fromCap:false,
                        toCap:true,
                        color:'red'});
}
    
// load_xyz(viewer1,'molecule')
// load_xyz(viewer2,'molecule')
// load_xyz(viewer3,'molecule')

add_functionality(slider_ao,update_orb_and_gradorb)
add_functionality(slider_grad,update_grad_and_gradorb)
add_functionality(slider_angular,update_all)
add_functionality(slider_ao_or_mo,update_all)
})
