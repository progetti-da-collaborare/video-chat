/**
 * Формирование таблицы контактов
 */
async function loadJSON(data){

    let a = document.querySelector('thead');
    let trr = document.createElement('tr');
    let th = document.createElement('th');
    let td;
    th.textContent = "фио преподавателя";
    trr.append(th);
    th = document.createElement('th');
    th.textContent = "электронная почта";
    trr.append(th);
    a.append(trr);

    a = document.querySelector('tbody');
    for(let i=0; i<data.length; ++i){
        trr = document.createElement('tr');
        td = document.createElement('td');
        td.textContent = data[i].name;
        trr.append(td);
        td = document.createElement('td');
        td.textContent = data[i].email;
        trr.append(td);
        a.append(trr);
    }
    a = document.querySelector('div');
    a.textContent = "";
}

//document.onload = (data) => {let qwe = document.querySelector('div'); loadJSON(JSON.parse(JSON.stringify(eval(qwe.textContent))))}
//document.onclick = () => {let qwe = document.querySelector('div'); alert(JSON.parse(JSON.stringify(eval(qwe.textContent))))}
//document.addEventListener('DOMContentLoaded', () => alert("DOM готов!"));
document.addEventListener('DOMContentLoaded', () => {let qwe = document.querySelector('div');
    loadJSON(JSON.parse(JSON.stringify(eval(qwe.textContent))))
});