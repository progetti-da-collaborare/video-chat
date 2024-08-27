//Получение разметки html для body и создание документа
async function loadFile(path){
  console.log("loadFile")
  const html = await fetch(path)
      .then(resp=>resp.text())
      .then(resp=>document.write(resp))
      .then(()=>{
        let s = document.createElement('link');
        s.setAttribute("href", "q/index.css");
        s.setAttribute("rel", "stylesheet");
        document.getElementsByTagName('head')[0].append(s);

        s = document.createElement('script');
        s.setAttribute("src", "q/scripts.js");
        document.getElementsByTagName('body')[0].append(s);
        document.getElementsByTagName('body')[0].setAttribute("class", "text-class");
        /*
        let s = document.createElement('link');
        s.innerText  = `href="_/index.css" rel="stylesheet"`;
        let p = document.getElementsByTagName('head')[0].append(s);
        */
        //<script src="_/scripts.js"></script>
        //<body class="text-class">
      })
}


//Вывод списка элементов - custom html tag
class ListOfElements extends HTMLElement {
/*
https://learn.javascript.ru/custom-elements
https://learn.javascript.ru/fetch
https://habr.com/ru/companies/ruvds/articles/415881/
*/
  connectedCallback() {
    console.log("---------qw--e");
      try{
        /*формат json файла
        img - адрес изображения для тега img
        legend - подпись
        index - порядковый номер
        */
        const shadow = this.attachShadow({ mode: "open" }); // sets and returns 'this.shadowRoot' 
            let list = fetch(this.getAttribute('jsonfile'))
                .then(resp=>resp.json())
                .then(resp=>{
                    let div1 = document.createElement('div');
                        for(let i = 0; i< resp.length; ++i){
                          console.log(resp[i]);
                            let div2 = document.createElement('div');
                            if(resp[i]["img"]){
                                let img = document.createElement('img');
                                img.src = resp[i]["img"];
                                div2.append(img);
                            }
                            if(resp[i]["index"]){
                                let p = document.createElement('p');
                                p.innerText = resp[i]["index"];
                                div2.append(p);
                            }
                            if(resp[i]["legend"]){
                                let p = document.createElement('p');
                                p.innerText = resp[i]["legend"];
                                div2.append(p);
                            }
                            div1.append(div2);
                        }
                        shadow.append(div1);

                        let s = document.createElement('style');
                        s.innerText = `
                        div {
                          display:flex;
                          text-align:center;
                          padding: 5px 5px;
                          border-width: 0px;
                        }
                        div{
                          display: flex;
                          flex-direction: row;
                          flex-wrap: wrap;
                          padding: 20px 20px 20px 20px ;
                          gap: 20px;
                          justify-content: center;
                          border-width: 0px;
                        }
                        div div{
                            flex-direction: column;
                            padding: 20px 20px 20px 20px ;
                            border: 2px solid #028c00;
                        }
                        `;
                        shadow.append(s)
                })
      } catch(e){
          console.log(e.message)
      }
  }
}

customElements.define("list-of-images", ListOfElements);


//Главный раздел
class Chapter extends HTMLElement {
    connectedCallback() {
        try{
          /*формат
          состоит из параграфов <p>,
          изображения <img> обтекаются текстом
          */
          const shadow = this.attachShadow({ mode: "open" }); // sets and returns 'this.shadowRoot' 
          let title = null;

          setTimeout(() =>{
            if(!this.getAttribute("class") || this.getAttribute("class") === ""){
              this.setAttribute("class", "mainsection")
            }
            switch(this.getAttribute("class")){
              case 'mainsection':
                  title = document.createElement("h2");
                  title.innerText = this.getAttribute("title") || "---Заголовок не задан---";
                  break;
              case 'subsection':
                  title = document.createElement("h3");
                  title.innerText = this.getAttribute("title") || "---Заголовок не задан---";
                  break;
          }
          shadow.append(title);

            let list = this.childNodes;
            let flag = false;  //В блоке ли из элементов раздела
                let div = null;
                /* div объединяет вложенные chapter-of-document во flex блок для правильного отображения
                <chapter-of-document>
                    <div>
                      <chapter-of-document>
                      </chapter-of-document>
                      <chapter-of-document>
                      </chapter-of-document>
                    </div>
                </chapter-of-document>
                */
            for(let i=0; i<list.length; ++i){
                let node = list[i];
                switch(node.nodeName){
                    case '#text':
                      console.log(node.nodeValue.trim());
                        if(node.nodeValue.trim().length === 0) break;
                        if(flag) {
                            shadow.append(div);
                            flag = false;
                            console.log(div);
                        }
                        let p = document.createElement("p");
                        p.textContent = node.nodeValue;
                        shadow.append(p);
                        break;
                    case 'CHAPTER-OF-DOCUMENT': /* по определению вложенный! */
                        if(!flag) {
                            div = document.createElement("div");
                            flag = true;
                        }
                        if(!node.getAttribute("class") || node.getAttribute("class") === ""){
                            node.setAttribute("class", "subsection")
                        }
                        div.appendChild(node.cloneNode(true));
                        break;
                    default:
                        //Так удаляются атрибуты
                        //let pp = document.createElement(`${list[i].nodeName}`);
                        //pp.textContent = list[i].textContent;
                        //shadow.appendChild(pp);
                        if(flag) {
                            shadow.append(div);
                            flag = false;
                        }
                        shadow.appendChild(node.cloneNode(true));
                        break;
                }
            }     
              if(flag) {
                  shadow.append(div);
                  flag = false;
                  console.log(div);
              }         
          })
/*
          let h2 = document.createElement('h2');
          let title = this.getAttribute('title');
          h2.innerHTML = title;
          shadow.append(h2);
          */
                          let s = document.createElement('style');
                          s.innerText = `
                          :host(.mainsection) {
                              padding: 10px 10px 10px 10px ;
                          }
                
                          :host(.subsection) {
                              flex:1 1 0;
                              display: flex;
                              flex-direction: column;
                              min-width: 20rem;
                              flex-basis: 48%;
                              justify-content: center;
                              align-items: center;
                              padding: 10px 10px 10px 10px ;
                          }

                          :host>div {
                            clear:both;
                        }
                
                          :host p {
                              text-align:justify;
                              text-indent: 50px;
                          }
                
                          :host ul {
                            flex:1 1 0;
                            text-align:left;
                          }
                          
                          :host(.mainsection) img {
                            float:right;
                            margin: 10px 40px 40px 40px;
                          }

                          :host(.subsection) img {
                            width: 20rem;
                            object-fit: scale-down;
                            padding: 0vw 0vw 0vh 0vw;
                          }

                          :host div {
                            display:flex;
                            flex-direction: row;
                            padding: 10px 10px 10px 10px ;
                            flex-wrap: wrap;
                            justify-content: center;
                          }

                          :host h2, :host h3 {
                            text-align:center;
                          }
                          `;
                          shadow.append(s)
        } catch(e){
            console.log(e.message)
        }
    }
  }
  
  customElements.define("chapter-of-document", Chapter);
/*
  function fu(){
  let f = window.document.getElementsByTagName("list-of-images")[0];
  console.log(f.ListOfElements);
  console.log(f.childNodes[1].nodeName);
  console.log(f.childNodes[2].nodeValue);
  console.log(`<p>${f.childNodes[0].textContent}</p>${f.childNodes[1].textContent}`);
  }
*/

//Главный раздел
class ListOfRows extends HTMLElement {
  connectedCallback() {
      try{
        const shadow = this.attachShadow({ mode: "open" }); // sets and returns 'this.shadowRoot' 
        let title = null;

        setTimeout(() =>{
          /*
          if(!this.getAttribute("class") || this.getAttribute("class") === ""){
            this.setAttribute("class", "mainsection")
          }
          switch(this.getAttribute("class")){
            case 'mainsection':
                title = document.createElement("h2");
                title.innerText = this.getAttribute("title") || "---Заголовок не задан---";
                break;
            case 'subsection':
                title = document.createElement("h3");
                title.innerText = this.getAttribute("title") || "---Заголовок не задан---";
                break;
        }
        shadow.append(title);
        */

          let list = this.childNodes;
          let flag = false;  //В блоке ли из элементов раздела
              let ul = document.createElement("ul");
              let li = null;

          for(let i=0; i<list.length; ++i){
              let node = list[i];
              switch(node.nodeName){
                  case '#text':   /* "--" - элемент списка, иначе абзац */
                      let jj = node.nodeValue.split(/(?=--)/g);
                      for(let y = 0; y<jj.length; ++y) {
                          let txt = jj[y].trim();
                          if(txt.length === 0) continue;
                          let isListItem = txt.substring(0,2) === "--"; //список или просто текст?
                          if(isListItem) {
                              flag = true;
                              txt = txt.substring(2).trim();
                              li = document.createElement("li");
                              li.textContent = txt;
                              ul.append(li)
                              continue;
                          }
                        
                          let p = document.createElement("p");
                          p.textContent = txt;
                          if(!flag) ul.append(p);
                          else li.append(p);
                      }
                      break;
                  default:
                      if(!flag) ul.appendChild(node.cloneNode(true));
                      else li.append(node.cloneNode(true));
                      break;
              }
          }     
                shadow.append(ul);
        })
/*
        let h2 = document.createElement('h2');
        let title = this.getAttribute('title');
        h2.innerHTML = title;
        shadow.append(h2);
        */
                        let s = document.createElement('style');
                        s.innerText = `
                        :host(.mainsection) {
                            padding: 10px 10px 10px 10px ;
                        }
              
                        :host(.subsection) {
                            flex:1 1 0;
                            display: flex;
                            flex-direction: column;
                            min-width: 20rem;
                            flex-basis: 48%;
                            justify-content: center;
                            align-items: center;
                            padding: 10px 10px 10px 10px ;
                        }

                        :host>div {
                          clear:both;
                      }
              
                        :host p {
                            text-align:justify;
                            text-indent: 50px;
                        }
              
                        :host ul {
                          flex:1 1 0;
                          text-align:left;
                        }
                        
                        :host(.mainsection) img {
                          float:right;
                          margin: 10px 40px 40px 40px;
                        }

                        :host(.subsection) img {
                          width: 20rem;
                          object-fit: scale-down;
                          padding: 0vw 0vw 0vh 0vw;
                        }

                        :host div {
                          display:flex;
                          flex-direction: row;
                          padding: 10px 10px 10px 10px ;
                          flex-wrap: wrap;
                          justify-content: center;
                        }

                        :host h2, :host h3 {
                          text-align:center;
                        }
                        `;
                        shadow.append(s)
      } catch(e){
          console.log(e.message)
      }
  }
}

customElements.define("list-of-textual-rows", ListOfRows);