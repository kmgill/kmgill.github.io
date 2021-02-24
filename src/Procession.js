

KMG.Procession = {};

/*
0 Pc;
1 Qc;
2 Ps;
3 Qs;
4 period;
*/
KMG.Procession.EclipticPrecessionTerms =
[
    [   486.230527, 2559.065245, -2578.462809,   485.116645, 2308.98 ],
    [  -963.825784,  247.582718,  -237.405076,  -971.375498, 1831.25 ],
    [ -1868.737098, -957.399054,  1007.593090, -1930.464338,  687.52 ],
    [ -1589.172175,  493.021354,  -423.035168, -1634.905683,  729.97 ],
    [   429.442489, -328.301413,   337.266785,   429.594383,  492.21 ],
    [ -2244.742029, -339.969833,   221.240093, -2131.745072,  708.13 ]
];

/*
0 pc;
1 epsc;
2 ps;
3 epss;
4 period;
*/
KMG.Procession.PrecessionTerms =
[
    [ -6180.062400,   807.904635, -2434.845716, -2056.455197,  409.90 ],
    [ -2721.869299,  -177.959383,   538.034071,  -912.727303,  396.15 ],
    [  1460.746498,   371.942696, -1245.689351,   447.710000,  536.91 ],
    [ -1838.488899,  -176.029134,   529.220775,  -611.297411,  402.90 ],
    [   949.518077,   -89.154030,   277.195375,   315.900626,  417.15 ],
    [    32.701460,  -336.048179,   945.979710,    12.390157,  288.92 ],
    [   598.054819,   -17.415730,  -955.163661,   -15.922155, 4042.97 ],
    [  -293.145284,   -28.084479,    93.894079,  -102.870153,  304.90 ],
    [    66.354942,    21.456146,     0.671968,    24.123484,  281.46 ],
    [    18.894136,    30.917011,  -184.663935,     2.512708,  204.38 ]
];


KMG.Procession.EclipticPrecession_P03LP = function(T)
{

    var T2 = T * T;
    var T3 = T2 * T;

	var PA = (5750.804069
               +  0.1948311 * T
               -  0.00016739 * T2
               -  4.8e-8 * T3);
    var QA = (-1673.999018
               +   0.3474459 * T
               +   0.00011243 * T2
               -   6.4e-8 * T3);


    var nTerms = KMG.Procession.EclipticPrecessionTerms.length / KMG.Procession.EclipticPrecessionTerms[0].length;
		
    for (var i = 0; i < nTerms; i++) {
        var p = KMG.Procession.EclipticPrecessionTerms[i];
        var theta = 2.0 * Math.PI * T / p[4];
        var s = Math.sin(theta);
        var c = Math.cos(theta);
        PA += p[0] * c + p[2] * s;
        QA += p[1] * c + p[3] * s;
    }

    return {
		PA : PA,
		QA : QA
	};
};




KMG.Procession.PrecObliquity_P03LP = function(T)
{

    var T2 = T * T;
    var T3 = T2 * T;

    var pA   = (  7907.295950
                   + 5044.374034 * T
                   -    0.00713473 * T2
                   +    6e-9 * T3);
    var epsA = (  83973.876448
                   -     0.0425899 * T
                   -     0.00000113 * T2);

    var nTerms = KMG.Procession.PrecessionTerms.length / KMG.Procession.PrecessionTerms[0].length;
    

    for (var i = 0; i < nTerms; i++) {
		var p = KMG.Procession.PrecessionTerms[i];
        
        var theta = 2.0 * Math.PI * T / p[4];
        var s = Math.sin(theta);
        var c = Math.cos(theta);
        pA   += p[0] * c   + p[2] * s;
        epsA += p[1] * c + p[3] * s;
    }

    return {
		pA : pA,
		epsA : epsA
	};
};


KMG.Procession.EquatorialPrecessionAngles_P03 = function(T)
{
    var T2 = T * T;
    var T3 = T2 * T;
    var T4 = T3 * T;
    var T5 = T4 * T;
    
    var zetaA =  (     2.650545
                   + 2306.083227 * T
                   +    0.2988499 * T2
                   +    0.01801828 * T3
                   -    0.000005971 * T4
                   -    0.0000003173 * T5);
    var zA =     ( -    2.650545 
                    + 2306.077181 * T
                    +    1.0927348 * T2
                    +    0.01826837 * T3
                    -    0.000028596 * T4
                    -    0.0000002904 * T5);
    var thetaA = (   2004.191903 * T
                   -     0.4294934 * T2
                   -     0.04182264 * T3
                   -     0.000007089 * T4
                   -     0.0000001274 * T5);
    
    return {
		zetaA : zetaA,
		zA : zA,
		thetaA : thetaA
	};
};

KMG.Procession.EclipticPrecession_P03 = function(T)
{
    var T2 = T * T;
    var T3 = T2 * T;
    var T4 = T3 * T;
    var T5 = T4 * T;
    
    var PA = (  4.199094 * T
              + 0.1939873 * T2
              - 0.00022466 * T3
              - 0.000000912 * T4
              + 0.0000000120 * T5);
    var QA = (-46.811015 * T
              + 0.0510283 * T2
              + 0.00052413 * T3
              - 0.00000646 * T4
              - 0.0000000172 * T5);
    
    return {
		PA : PA,
		QA : QA
	};
};


KMG.Procession.EclipticPrecessionAngles_P03 = function(T)
{
    var T2 = T * T;
    var T3 = T2 * T;
    var T4 = T3 * T;
    var T5 = T4 * T;
    
    var piA = ( 46.998973 * T
               - 0.0334926 * T2
               - 0.00012559 * T3
               + 0.000000113 * T4
               - 0.0000000022 * T5);
    var PiA = (629546.7936
                - 867.95758 * T
                +   0.157992 * T2
                -   0.0005371 * T3
                -   0.00004797 * T4
                +   0.000000072 * T5);
    
    return {
		piA : piA,
		PiA : PiA
	};
};

KMG.Procession.eps0 = 84381.40889;

KMG.Procession.PrecObliquity_P03 = function(T)
{
    var T2 = T * T;
    var T3 = T2 * T;
    var T4 = T3 * T;
    var T5 = T4 * T;
    
    var epsA = (KMG.Procession.eps0
                - 46.836769 * T
                -  0.0001831 * T2
                +  0.00200340 * T3
                -  0.000000576 * T4
                -  0.0000000434 * T5);
    var pA   = ( 5028.796195 * T
                +   1.1054348 * T2
                +   0.00007964 * T3
                -   0.000023857 * T4
                -   0.0000000383 * T5);

    return {
		epsA : epsA,
		pA : pA
	};
};
