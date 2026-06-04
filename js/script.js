// ================== VARIÁVEIS GLOBAIS ==================
// Guardam os dados dos filmes por década (base principal e manual)
let filmesDecadas = {};
let filmesDecadasManuais = {};

// ================== CARREGA BASE DE DÉCADAS ==================
// Busca o JSON principal com filmes organizados por década
fetch("filmes_famosos_decadas.json")
  .then(r => r.json())
  .then(data => {
    filmesDecadas = data;
  })
  .catch(err => console.error("Erro ao carregar JSON de décadas:", err));


// ================== MANUAL (NOVO) ==================
// Carrega uma segunda base (casos manuais ou ajustes específicos)
fetch("filmes_decadas_manual.json")
  .then(r => r.json())
  .then(data => {
    filmesDecadasManuais = data;
  })
  .catch(err => console.error("Erro ao carregar JSON manual:", err));


// ================== CONTROLE DE SEÇÕES ==================
// Função que troca entre HOME, TOP10, DÉCADAS e POPULARES
function mostrarSecao(id){

  console.log("CLICOU:", id);

  // Esconde todas as seções
  document.querySelectorAll(".secao").forEach(s => s.style.display = "none");
  document.getElementById("home").style.display = "none";

  const secao = document.getElementById(id);

  if(secao){
    secao.style.display = "block";

    // Carrega dados da seção específica quando aberta
    if(id === "top10") carregarTop10();
    if(id === "decadas") carregarDecadas();
    if(id === "populares") carregarPopulares();
  }
}


// ================== VOLTAR HOME ==================
// Abre popup com detalhes completos do filme clicado no Top 10
function voltarHome(){
  document.querySelectorAll(".secao").forEach(s => s.style.display = "none");
  document.getElementById("home").style.display = "block";
}


// ================== MODAL GLOBAL ==================
function abrirModalTop10(filme){

  const modal = document.getElementById("modal");
  const content = document.getElementById("modal-content");

  // pega sinopse 
  const sinopse =
    filme.Plot ||
    "Sem descrição disponível.";

  // monta conteúdo do modal
  content.innerHTML = `
    <div class="text-center">

      <img src="${filme.Poster_Link}" 
           style="width:180px; border-radius:10px; margin-bottom:15px;">

      <h3>${filme.Series_Title}</h3>

      <p>⭐<strong>Nota IMDb:</strong> ${filme.IMDB_Rating}</p>
      <p>📅<strong>Ano de lançamento:</strong> ${filme.Released_Year}</p>

      <hr>

      <p style="text-align:justify; text-light mb-6;">
        <strong>🎬Sinopse:</strong> ${sinopse}
      </p>

    </div>
  `;

  modal.style.display = "flex";
}


// ================== FECHAR MODAL ==================
// Fecha popup global
function fecharModal(){
  document.getElementById("modal").style.display = "none";
}


// ================== TOP 10 FILMES ==================
// Carrega lista do Top 10 e cria cards 
function carregarTop10(){

  fetch("top10_filmes.json")
    .then(r => r.json())
    .then(data => {

      const container = document.getElementById("top10-container");
      container.innerHTML = "";

      // inverte para mostrar ranking correto (10 → 1)
      const filmes = data.slice().reverse();

      filmes.forEach((filme, index) => {

        const topNumber = 10 - index;

        const card = document.createElement("div");
        card.className = "col-md-4 mb-4 opacity-0 translate-middle-y";

        card.innerHTML = `
          <div class="card bg-dark text-light h-100 border-secondary position-relative">

            <div class="top-badge">
              TOP ${topNumber}
            </div>

            <img src="${filme.Poster_Link}" class="card-img-top">

            <div class="card-body">
            <h6 class="fw-bold">${filme.Series_Title}</h6>

        <p class="mb-1">
          ⭐ <strong>Nota IMDb:</strong> ${filme.IMDB_Rating}
        </p>

        <p class="mb-0">
          📅 <strong>Ano de lançamento:</strong> ${filme.Released_Year}
        </p>
        </div>

          </div>
        `;

        // ================= CLIQUE MODAL =================
        card.style.cursor = "pointer";
        
        // abre modal ao clicar no card
        card.addEventListener("click", () => {
          abrirModalTop10(filme);
        });

        container.appendChild(card);

        // ================= ANIMAÇÃO TOP 10 =================
       // animação de entrada dos cards
        let delay = index * 2000;

      if (topNumber === 3) delay += 3000;
      if (topNumber === 2) delay += 5000;
      if (topNumber === 1) delay += 8000;

        setTimeout(() => {
          card.style.transition = "all 0.7s ease";
          card.classList.remove("opacity-0", "translate-middle-y");
        }, delay);

      });

    })
    .catch(e => console.error("Erro Top10:", e));
}


// ================== FILMES POR DÉCADAS ==================
// Mostra evolução do cinema por décadas + gráfico
function carregarDecadas(){

  fetch("filmes_por_decada.json")
    .then(r => r.json())
    .then(data => {

      const container = document.getElementById("decadas-container");
      container.innerHTML = "";

      // ordena décadas corretamente
      const sorted = data.slice()
        .sort((a,b) => parseInt(a.Decada) - parseInt(b.Decada));

      sorted.forEach(d => {

        const card = document.createElement("div");
        card.className = "col-md-3 mb-4";

        card.innerHTML = `
          <div class="card text-light h-100 border-secondary p-3"
               style="background-color: rgba(50,50,50,0.9); cursor:pointer;">
            <h5>📅 ${d.Decada}</h5>
            <p class="fw-bold">Filmes: ${d.Quantidade}</p>
          </div>
        `;

        // abre modal com filmes da década
        card.addEventListener("click", () => {

          const chave = String(d.Decada).trim();

          const filmes =
            filmesDecadasManuais[chave] ||
            filmesDecadas[chave];

          if(!filmes || filmes.length === 0){
            alert("Sem filmes cadastrados nessa década");
            return;
          }

          abrirModalDecada(chave, filmes);
        });

        container.appendChild(card);
      });

      // gráfico de linha com evolução das décadas
      const canvas = document.getElementById("decadasChart");

      if (window.decadasChartInstance) {
        window.decadasChartInstance.destroy();
      }

      window.decadasChartInstance = new Chart(canvas, {
        type: "line",
        data: {
          labels: sorted.map(d => d.Decada),
          datasets: [{
            label: "Filmes por década (1920–2020)",
            data: sorted.map(d => d.Quantidade),
            borderColor: "#28a745",
            backgroundColor: "rgba(40,167,69,0.2)",
            fill: true,
            tension: 0.3
          }]
        }
      });

    })
    .catch(e => console.error("Erro décadas:", e));
}

// ================== POPULARES ==================
// Mostra filmes com mais votos (popularidade real)
function carregarPopulares(){

  const container = document.getElementById("populares-container");

  container.innerHTML = "";

  fetch("filmes_populares.json")
    .then(response => response.json())
    .then(data => {

      const top3 = data.slice(0, 3);

      // ================= DESTAQUES =================
      // destaque dos 3 mais votados
      container.innerHTML += `
        <div class="row text-center mb-4"
            style="background: linear-gradient(135deg, #3a2a00, #c9a227); 
            padding: 20px; 
            border-radius: 15px; 
            color: white;">

              <h4>🏆 Destaques de Popularidade</h4>

              <p>
                Os filmes mais votados da base de dados foram:
              </p>

              <div class="row text-center mb-4">

                <div class="col-md-4 top3-focus">
                  <img src="${top3[0].Poster_Link}" class="img-fluid rounded mb-2" style="max-height:250px; "width:320px">
                  <h6>${top3[0].Series_Title}</h6>
                  <p>👥 ${Number(top3[0].No_of_Votes).toLocaleString()} votos</p>
                </div>

                <div class="col-md-4 top3-focus">
                  <img src="${top3[1].Poster_Link}" class="img-fluid rounded mb-2" style="max-height:250px;">
                  <h6>${top3[1].Series_Title}</h6>
                  <p>👥 ${Number(top3[1].No_of_Votes).toLocaleString()} votos</p>
                </div>

                <div class="col-md-4 top3-focus">
                  <img src="${top3[2].Poster_Link}" class="img-fluid rounded mb-2" style="max-height:250px;">
                  <h6>${top3[2].Series_Title}</h6>
                  <p>👥 ${Number(top3[2].No_of_Votes).toLocaleString()} votos</p>
                </div>

              </div>

              <p class="text-light fs-5">
                Isso demonstra que esses filmes tiveram enorme alcance global e mantiveram altos níveis de engajamento do público ao longo dos anos.
              </p>
              <!-- CARDS INFORMATIVOS -->
<div class="col-12 mb-4">

  <div class="row">

    <div class="col-md-6 mb-3">
      <div class="card border-0 h-100"
           style="background: rgba(13,110,253,0.15);
                  color:white;
                  border-radius:15px;">

        <div class="card-body">

          <h4>📝 Análise dos Dados</h4>

          <p class="mb-0">
            Observa-se uma forte concentração de votos em poucos títulos, indicando que grande parte do engajamento do público se direciona para obras extremamente populares.

          Os três primeiros colocados ultrapassam a marca de 2 milhões de votos cada, evidenciando grande alcance e impacto dentro da plataforma IMDb.
          </p>

        </div>

      </div>
    </div>

    <div class="col-md-6 mb-3">
      <div class="card border-0 h-100"
           style="background: rgba(13,110,253,0.15);
                  color:white;
                  border-radius:15px;">

        <div class="card-body">

          <h4>❓Curiosidade</h4>

          <p class="mb-0">
            The Shawshank Redemption não foi um grande sucesso de bilheteria no cinema quando foi lançado em 1994. No entanto, ao longo dos anos, o filme ganhou enorme popularidade por meio da TV aberta, locadoras e posteriormente com o DVD e a internet. Esse crescimento gradual fez com que a obra se consolidasse como um clássico cult moderno, acumulando hoje um dos maiores números de votos do IMDb.
          </p>

        </div>

      </div>
    </div>

  </div>

</div>
      `;
          // FECHA O BLOCO DOURADO AQUI ↑

      container.innerHTML += `
        <!-- OUTROS FILMES (FORA DO DOURADO) -->
      <div class="col-12 mb-4">
      <div class="card text-light border-0"
       style="background: rgba(255,255,255,0.05);
border: 1px solid rgba(255,255,255,0.1);; border-radius:15px;">
      <div class="card-body">

      <h4>🎥 Outros Filmes de Grande Impacto</h4>

      <p>
        Além dos três filmes mais votados da base de dados, os títulos abaixo também alcançaram números impressionantes de avaliações no IMDb, demonstrando forte popularidade e reconhecimento mundial ao longo dos anos.
      </p>

    </div>
  </div>
</div>
      `;
      
      // ================= RESTANTE DOS FILMES =================
      
      data.slice(3).forEach(filme => {

        const card = document.createElement("div");
        card.className = "col-md-4 mb-4";

        card.innerHTML = `
          <div class="card bg-dark text-light h-100 border-secondary">

            <img src="${filme.Poster_Link}" class="card-img-top">

            <div class="card-body">
              <h6>${filme.Series_Title}</h6>
              <p>⭐ <strong>Nota IMDb:</strong> ${filme.IMDB_Rating}</p>
              <p>👥 ${Number(filme.No_of_Votes).toLocaleString()} votos</p>
            </div>

          </div>
        `;

        container.appendChild(card);

      });

    })
    .catch(err => {
      console.error("Erro:", err);
      container.innerHTML = "<h3>Erro ao carregar filmes.</h3>";
    });

}




// ================== MODAL DÉCADAS ==================
// Mostra 3 filmes principais da década clicada
function abrirModalDecada(decada, filmes){

  const modal = document.getElementById("modal");
  const content = document.getElementById("modal-content");

  let html = `
    <div class="text-center">
      <h3>📅 Década ${decada}</h3>
      <hr>
  `;

  filmes.slice(0, 3).forEach(f => {

    html += `
      <div class="mb-4">

        <img src="${f.poster || f.Poster_Link}" style="width:120px; border-radius:6px;"><br>

        <strong>${f.title || f.Series_Title}</strong><br>

        <p style="margin:5px 0;">
          <strong>Avaliação IMDb:</strong>
          <span style="color:#ffc107;">⭐ ${f.rating || f.IMDB_Rating}</span>
        </p>

      </div>
    `;
  });

  html += `</div>`;

  content.innerHTML = html;

  modal.style.display = "flex";

document.addEventListener("click", (e) => {

  const card = e.target.closest(".top3-focus");

  if (!card) return;

  const img = card.querySelector("img");
  const title = card.querySelector("h6");
  const votes = card.querySelector("p");

  const modal = document.getElementById("focusModal");
  const focusImg = document.getElementById("focusImg");
  const focusTitle = document.getElementById("focusTitle");
  const focusVotes = document.getElementById("focusVotes");

  focusImg.src = img.src;
  focusTitle.innerText = title.innerText;
  focusVotes.innerText = votes.innerText;

  modal.style.display = "flex";
}
)};
