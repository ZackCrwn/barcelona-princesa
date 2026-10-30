// EDITA ESTE ARCHIVO PARA ACTUALIZAR LUGARES, PRECIOS Y RECOMENDACIONES.
const BARCELONA_PLACES = [
{name:"Catedral de Barcelona",icon:"⛪",type:"pago",price:"Exterior gratis · interior/visita desde aprox. 10–15 €",description:"Arquitectura gótica, claustro y una atmósfera especial en pleno Barri Gòtic.",tip:"Llega temprano para recorrer el centro histórico con calma.",url:"https://catedralbcn.org/"},
{name:"Pont del Bisbe y Barri Gòtic",icon:"🌉",type:"gratis",price:"Gratis",description:"Un puente precioso y callejuelas medievales perfectas para perderse un ratito.",tip:"Camina sin prisa y mira los detalles de los edificios.",url:"https://www.barcelonaturisme.com/"},
{name:"Columnas del Temple d’August",icon:"🏛️",type:"gratis",price:"Gratis",description:"Restos de un templo romano escondidos entre las calles del barrio Gótico.",tip:"Una parada breve para añadir historia antigua al paseo.",url:"https://www.barcelona.cat/museuhistoria/"},
{name:"Plaça del Rei",icon:"🏰",type:"gratis",price:"Exterior gratis · MUHBA aprox. 7–10 €",description:"Una plaza monumental que conserva el ambiente de la Barcelona medieval.",tip:"Comprueba la programación del museo si quieres entrar.",url:"https://www.barcelona.cat/museuhistoria/"},
{name:"Santa Maria del Mar",icon:"🕯️",type:"gratis",price:"Exterior gratis · visita cultural/torres con coste",description:"Basílica gótica luminosa y sobria, junto a las calles del Born.",tip:"Combínala con un paseo tranquilo por El Born.",url:"https://www.santamariadelmarbarcelona.org/"},
{name:"El Born Centre de Cultura i Memòria",icon:"🌷",type:"gratis",price:"Acceso general normalmente gratis · actividades variables",description:"Un antiguo mercado con restos arqueológicos y memoria de la ciudad.",tip:"Buena opción para un rato cultural si llueve.",url:"https://elbornculturaimemoria.barcelona.cat/"},
{name:"Plaça de Sant Felip Neri",icon:"♡",type:"gratis",price:"Gratis",description:"Una pequeña plaza escondida, íntima y llena de historia.",tip:"Visítala con respeto y disfruta de su tranquilidad.",url:"https://www.barcelonaturisme.com/"},
{name:"Sagrada Família",icon:"✧",type:"pago",price:"Aprox. 26–40 € según modalidad",description:"Una visita imprescindible para admirar la luz, las columnas y la arquitectura de Gaudí.",tip:"Reserva con antelación en la web oficial.",url:"https://sagradafamilia.org/"},
{name:"Monestir de Pedralbes",icon:"🌸",type:"pago",price:"Aprox. 5–12 € según tarifa",description:"Un monasterio histórico sereno, ideal para una visita pausada.",tip:"Deja tiempo para recorrer el claustro y sus espacios.",url:"https://monestirpedralbes.barcelona/"}
];
const BARCELONA_DAYS = [
{day:"DÍA 01",title:"Piedra e historia",route:"Catedral · Pont del Bisbe · Barri Gòtic · Temple d’August · Plaça del Rei.",pause:"Pausa: sentarse en una plaza y tomar algo caliente."},
{day:"DÍA 02",title:"El Born y el mar",route:"Santa Maria del Mar · El Born Centre · paseo por las calles del Born.",pause:"Pausa: comida larga y paseo digestivo."},
{day:"DÍA 03",title:"La gran visita",route:"Sagrada Família por la mañana y tarde libre para descansar.",pause:"Pausa: volver a descansar y dejar la tarde abierta."},
{day:"DÍA 04",title:"Un monasterio sereno",route:"Monestir de Pedralbes · paseo cercano · regreso con margen.",pause:"Pausa: paseo tranquilo antes de volver."}
];