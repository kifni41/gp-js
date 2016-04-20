
/*DEKLARASI VARIABEL PARAMETER GP*/
	var probCross = 0.9;
	var probMutate = 0.05;
	var popSize = 200;
	var maxGen = 100;

	var temp_syntax = [];

	/*probabilitas dipilihnya function dalam mengisi node tree*/
	var probFunction = 0.5;

	/*probabilitas dipilihnya nilai konstant, dibanding dengan variabel*/
	var probConstant = 0.5;

	var listFunction = ["+","-","*"];

	var listConstant = [1,2,3,4,5,6,7,8,9];
	var listVariable = ['x','y'];

	var counter_left = 0;
	var counter_right = 0;

	var maxDeep = 5;

	/*minimum batas firness untuk data diambil sebagai calon parent*/
	var minFitness = 0.001;

	var targerFitness = 0.9; 
/*END DEKLARASI*/

/*TRAINIGN DATA*/
var trainingData = [
	{'x' : 1, 'y' : 2, 'z': 1},
	{'x' : 2, 'y' : 2, 'z': 12},
	{'x' : 3, 'y' : 3, 'z': 5},
	{'x' : 4, 'y' : 5, 'z': 46},
	{'x' : 5, 'y' : 3, 'z': 18},
	{'x' : 6, 'y' : 5, 'z': 56},
	{'x' : 7, 'y' : 4, 'z': 35},
	{'x' : 8, 'y' : 6, 'z': 84},
	{'x' : 9, 'y' : 3, 'z': 56},
	{'x' : 10,'y' : 8, 'z': 148},
];


/*START PROSES EVOLUSI*/
function evolution(){
	/*semua populasi pada saat itu*/
	var population = [];
	var bestIndividual = null; 
	var iterasi = 0;

	var candidateOffspring = []; 
	var offspring = [];

	for(var itr = 0; itr < maxGen; itr++){
		console.log('============================= '+itr +' ==========================');
		if(itr==0){
			/*ITERASI PERTAMA INISIALISASI*/
			population = [];
			candidateOffspring = [];
			for(var i=0;i<popSize;i++){
				population[i] = generateRandom();
				if(parseFloat(1/(1+population[i].error)) > minFitness){
					candidateOffspring.push(population[i]);
					//console.log(population[i].error);
				}
				if(bestIndividual == null || population[i].error < bestIndividual.error ){
					bestIndividual = $.extend(true,{},population[i]);
				}
			}

			//sort population accesing from lowest error
			population.sort(function(a, b){
			 return a.error-b.error;
			});

			console.log('#JUMLAH INDIVIDU AWAL = ' +population.length);
			//console.log('#JUMLAH CANDIDATE OFFSPRING = ' +candidateOffspring.length);
			//console.log("#BEST ERROR =" +bestIndividual.error);
		}

		/*CROSSOVER*/
		var countCross = 0;
		var crossProcess = true;

		while(crossProcess){
			if(candidateOffspring.length >1 ){
				random = Math.floor(Math.random()*candidateOffspring.length);
				var gen1 = $.extend(true,{},candidateOffspring[random]);
				candidateOffspring.splice(random,1);
				random = Math.floor(Math.random()*candidateOffspring.length);
				var gen2 = $.extend(true,{},candidateOffspring[random]);
				candidateOffspring.splice(random,1);
				if(Math.random() < probCross){
					var crossResult = crossover(gen1,gen2);
					countCross++;
					//hanya hasill crossover yang sehat yang diambil
					if(parseFloat(1/(1+crossResult[0].error)) > minFitness){
						offspring.push(crossResult[0]);
						if(crossResult[0].error < bestIndividual.error ){
							bestIndividual = $.extend(true,{},crossResult[0]);
						}
					}
					if(parseFloat(1/(1+crossResult[1].error)) > minFitness){
						offspring.push(crossResult[1]);
						if(crossResult[1].error < bestIndividual.error ){
							bestIndividual = $.extend(true,{},crossResult[1]);
						}
					}
				}else{
					//tidak crossover, langsung masukan ke list offspring
					offspring.push(gen1);
					offspring.push(gen2);
				}
			}else if(candidateOffspring.length == 1){
				//jika candidate tinggal satu, langsung masukkan ke dalam offspring list
				offspring.push(candidateOffspring[0]);
				candidateOffspring.splice(0,1);
			}else{
				crossProcess = false;
			}
		}

		console.log('#JUMLAH CROSSOVER DILAKUKAN = ' +countCross);
		console.log("#BEST ERROR =" +bestIndividual.error);

		/*MUTASI*/
		var countMutasi = 0;
		for(var i = 0; i < offspring.length;i++){
			if(Math.random() < probMutate){
				countMutasi++;
				var mutan =  mutasi(offspring[i]);
				if(parseFloat(1/(1+mutan.error)) > minFitness){
					offspring[i] = $.extend(true,{},mutan);
					if(mutan.error < bestIndividual.error ){
						bestIndividual = $.extend(true,{},mutan);
					}
				}
			}
		}
		console.log('#JUMLAH MUTASI DILAKUKAN = ' +countMutasi);
		//console.log("#BEST ERROR =" +bestIndividual.error);
		//console.log('#JUMLAH OFFSPRING LOLOS = ' +offspring.length);

		if(offspring.length < popSize){
			offSpringLen = offspring.length;
			//jika hasil offspring kurang dari popsize, tambahkan individu terbaik dari populasi sebelumnya
			for(var i = 0 ; i < (popSize - offSpringLen);i++){
				var gen = $.extend(true,{},population[i]);
				offspring.push(gen);
			}
		}

		population= [];
		population = offspring.slice(0);
		offspring=[];

		if( (1/(1+bestIndividual.error)) >= targerFitness){
			break;
		}else{
			console.log("#CURRENT BEST ERROR = " + bestIndividual.error);
			console.log("#CURRENT BEST FITNESS = " + (1/(1+bestIndividual.error)));
		}
		console.log('============================================================');
	}
}

/*FUNGSI CROSSOVER 2 GEN*/
function crossover(gen1, gen2){
	var level = Math.floor(Math.random() * maxDeep);
	var current = [gen1.tree.root,gen2.tree.root];
	var path_swap = [[],[]];
	var path_swap_obj = ["",""];
	for(var i = 0; i <= level; i++){
		if( (current[0].left == null & current[0].right == null) || (current[1].left == null & current[1].right == null) ){
			break;
		}else{
			left = (Math.random() >0.5);
			if(left){
				current[0] = current[0].left;
				path_swap[0].push('left');
				path_swap_obj[0] += path_swap_obj[0] == "" ? ("left") : (".left");
			}else{
				current[0] = current[0].right;
				path_swap[0].push('right');
				path_swap_obj[0] += path_swap_obj[0] == "" ? ("right") : (".right");
			}
			left = (Math.random() >0.5);
			if(left){
				current[1] = current[1].left;
				path_swap[1].push('left');
				path_swap_obj[1] += path_swap_obj[1] == "" ? ("left") : (".left");
			}else{
				current[1] = current[1].right;
				path_swap[1].push('right');
				path_swap_obj[1] += path_swap_obj[1] == "" ? ("right") : (".right");
			}
		}
	}

	switch(path_swap[0].length){
		case 1 : 
			var temp = $.extend(true,{},gen1.tree.root[path_swap[0][0]]);
			gen1.tree.root[path_swap[0][0]] = $.extend(true,{},gen2.tree.root[path_swap[1][0]]);
			gen2.tree.root[path_swap[1][0]] = $.extend(true,{},temp);
			break;
		case 2 :
			var temp = $.extend(true,{},gen1.tree.root[path_swap[0][0]][path_swap[0][1]]);
			gen1.tree.root[path_swap[0][0]][path_swap[0][1]] = $.extend(true,{},gen2.tree.root[path_swap[1][0]][path_swap[1][1]]);
			gen2.tree.root[path_swap[1][0]][path_swap[1][1]] = $.extend(true,{},temp);
			break;
		case 3 :
			var temp = $.extend(true,{},gen1.tree.root[path_swap[0][0]][path_swap[0][1]][path_swap[0][2]]);
			gen1.tree.root[path_swap[0][0]][path_swap[0][1]][path_swap[0][2]] = $.extend(true,{},gen2.tree.root[path_swap[1][0]][path_swap[1][1]][path_swap[1][2]]);
			gen2.tree.root[path_swap[1][0]][path_swap[1][1]][path_swap[1][2]] = $.extend(true,{},temp);
			break;
		case 4 :
			var temp = $.extend(true,{},gen1.tree.root[path_swap[0][0]][path_swap[0][1]][path_swap[0][2]][path_swap[0][3]]);
			gen1.tree.root[path_swap[0][0]][path_swap[0][1]][path_swap[0][2]][path_swap[0][3]] = $.extend(true,{},gen2.tree.root[path_swap[1][0]][path_swap[1][1]][path_swap[1][2]][path_swap[1][3]]);
			gen2.tree.root[path_swap[1][0]][path_swap[1][1]][path_swap[1][2]][path_swap[1][3]] = $.extend(true,{},temp);
			break;
	}
	gen1.postfix = getPostfix(gen1.tree.root,[]);
	gen1.error = calculateError(gen1.postfix);
	gen2.postfix = getPostfix(gen2.tree.root,[]);
	gen2.error = calculateError(gen2.postfix);

	return [gen1,gen2];
}

/*FUNGSI MUTASI*/
function mutasi(gen){
	var mutan = $.extend(true,{},gen);
	var level = Math.floor(Math.random() * maxDeep);
	var current = mutan.tree.root;
	var path = [];
	for(var i = 0; i <= level; i++){
		if(current.left == null & current.right == null){
			break;
		}else{
			left = (Math.random() >0.5);
			if(left){
				current = current.left;
				path.push("left");
			}else{
				current = current.right;
				path.push("right");
			}
		}
	}
	if(listFunction.indexOf(current.data) != -1){
		replacement = current.data;
		while(replacement == current.data){
			replacement = listFunction[Math.floor(Math.random() * listFunction.length)];
		}
	}else{
		//console.log('terminal');
		replacement = current.data;
		while(replacement == current.data){
			if(Math.random() < probConstant){
				//konstant dipilih
				replacement = listConstant[Math.floor(Math.random() * listConstant.length)];
			}else{
				//variable dipilih
				replacement = listVariable[Math.floor(Math.random() * listVariable.length)];
			}
		}
	}

	switch(path.length){
		case 1 : 
			mutan.tree.root[path[0]].data = replacement;
			break;
		case 2 :
			mutan.tree.root[path[0]][path[1]].data = replacement;
			break;
		case 3 :
			mutan.tree.root[path[0]][path[1]][path[2]].data = replacement;
			break;
		case 4 :
			mutan.tree.root[path[0]][path[1]][path[2]][path[3]].data = replacement;
			break;
	}
	mutan.postfix = getPostfix(mutan.tree.root,[]);
	mutan.error = calculateError(mutan.postfix);

	return mutan;
}



/*GET INFIX DARI TREE*/
function getInfix(node,infix){
    if (!(node == null)) { 
        getInfix(node.left,infix); 
        //console.log(node.show() + " ");
        infix.push(node.show());
        getInfix(node.right,infix); 
    } 
    return infix;
}

/*GET POSTFIX DARI TREE*/
function getPostfix(node,postfix){
    if (!(node == null)) { 
        getPostfix(node.left,postfix); 
        getPostfix(node.right,postfix); 

        postfix.push(node.show());
    } 

    return postfix;
}

/*MENGHITUNG NILAI INFIX DENGAN PARAMETER X DAN Y*/
function calculatePostfix(postfix, x, y){
	var postfixStack = [];
	postfix.forEach( function(current) {
	    if (isOperator(current) ) {
	    	var calculation = compute( postfixStack.pop(), symbolToOperator(current), postfixStack.pop() );
	        postfixStack.push(calculation);
	    }
	    else {
	    	if(current == 'x'){
	    		postfixStack.push(x);
	    	}else if(current == 'y'){
	    		postfixStack.push(y);
	    	}else{
	    		postfixStack.push(parseInt(current));
	    	}
	        
	    }   
	});

	return postfixStack[0];
}

/*KALKULASI ERROR, NILAI POSTFIX DENGAN TRAINING DATA*/
function calculateError(postfix){
	var sum_error = 0;
	trainingData.forEach(function(current){
		postfix_calc = calculatePostfix(postfix,current.x,current.y);
		sum_error += postfix_calc > current.z ? (postfix_calc-current.z) : (current.z - postfix_calc);
	});

	return sum_error;
}

function calculateFitness(postfix){
	var sum_error = 0;
	trainingData.forEach(function(current){
		postfix_calc = calculatePostfix(postfix,current.x,current.y);
		console.log("#" +current.z +" VS " +postfix_calc);
		console.log("#err = " +( postfix_calc > current.z ? (postfix_calc-current.z) : (current.z - postfix_calc)) );
		sum_error += postfix_calc > current.z ? (postfix_calc-current.z) : (current.z - postfix_calc);
	});

	return {'error':sum_error, 'fitness':(1/(1+sum_error))};
}

/*GENERATE RANDOM TREE*/
function generateRandom(){
	var tree = new Tree();

	//inisialiasi root dengan random function
	var rNode = new Node(listFunction[Math.floor(Math.random() * listFunction.length)] ,null,null,1);
	tree.root = rNode;
	tree.root = generateChild(tree.root);

	postfix = getPostfix(tree.root,[]);
	error = calculateError(postfix);

	return {'tree':tree,'postfix':postfix, 'error' : error};
}
/*FUNGSI REKURSIF DIGUNAKAN UNTUK MENGENERATE ANAK DARI ROOT*/
function generateChild(parent){
	if(listFunction.indexOf(parent.data) != -1){
		forceTerminal = (parent.deep+1) == parseInt(maxDeep);
		parent.left = generateRandomNode(parent.deep+1, forceTerminal );
		parent.right = generateRandomNode(parent.deep+1, forceTerminal );

		parent.left = generateChild(parent.left);
		parent.right = generateChild(parent.right);
	}
	return parent;
}

function generateRandomNode(deep,forceTerminal){
	//menentukan mengisi node dengan terminal atau function, dengan probalilitas function
	if( !forceTerminal && (Math.random() < probFunction) ){
		//funtion dipilih
		var nd = new Node(listFunction[Math.floor(Math.random() * listFunction.length)] ,null,null,deep);
	}else{
		//terminal dipilih
		//menentukan apakah memilih angka konstant atau variable
		if(Math.random() < probConstant){
			//konstant dipilih
			var nd = new Node(listConstant[Math.floor(Math.random() * listConstant.length)] ,null,null,deep);
		}else{
			//variable dipilih
			var nd = new Node(listVariable[Math.floor(Math.random() * listVariable.length)] ,null,null,deep);
		}
	}

	return nd;
}


/*TREE*/
	function Node(data, left, right, deep) { 
		this.show = show; 
	    this.data = data;
	    this.left = left; 
	    this.right = right; 
	    this.deep = deep;
	    
	} 
	function show() { 
	    return this.data; 
	} 

	function Tree() { 
	    this.root = null; 
	}

	function inOrder(node) { 
	    if (!(node == null)) { 
	        inOrder(node.left); 
	        console.log(node.show() + " ");
	        temp_syntax.push(node.show());
	        //here = node.show;
	        inOrder(node.right); 
	    } 
	    //return here;
	}

	function preOrder(node) { 
	    if (!(node == null)) { 
	        console.log(node.show() + " "); 
	        preOrder(node.left); 
	        preOrder(node.right); 
	    } 
	} 

	function postOrder(node) { 
	    if (!(node == null)) { 
	        postOrder(node.left); 
	        postOrder(node.right); 
	        console.log(node.show() + " "); 
	    } 
	} 
/*END TREE*/

/*POSTFIX CALCULATION*/
	function isOperator(toCheck) {
	    switch (toCheck) {
	        case '+':
	        case '-':
	        case '*':
	        case '/':
	        case '%':
	            return true;
	        default:
	            return false;
	    }
	}

	function compute(a, operator, b) {
	    return operator(a,b); 
	}

	function symbolToOperator(symbol) {
	    switch (symbol) {
	        case '+': return plus;
	        case '-': return minus;
	        case '*': return multiply;
	        case '/': return divide;
	        case '%': return modulo;
	    }
	}

	function plus(a,b) { return a + b; } 
	function minus(a,b) { return a - b; }
	function multiply(a,b) { return a * b; }
	function divide(a,b) { return a / b; }
	function modulo(a,b) { return a % b; }
/*POSTFIX CALCULATION*/




