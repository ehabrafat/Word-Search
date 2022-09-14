const grid = document.getElementById("grid")
const wordsDiv = document.getElementById("words")
const winAudio = document.getElementById("winAudio")
const finishAudio = document.getElementById("finishAudio")
const n = 14
const m = 12

const colors = ["#e5e5b8", "#1a7a6d", "#dfb6a0", "#d66fa2", "#636615", "#46678b", "#b9582e", "#e5e5bc", "#ffe166", "#ffba01", "#46a5ff", "#58c900", "#e8bfe8"]
const words = ["APPLE", "LEMON", "BANANA", "LIME", "ORANGE", "WATERMELON", "GRAPE", "KIWI", "STRAWBERRY"]
let blocks = []
let board = []
let seen = []   
let solved = []

let dx = [-1,0,1,-1,1,-1,0,1]
let dy = [-1,-1,-1,0,0,1,1,1]


function start(){
    for(let i = 0; i < n; ++i){
        board[i] = new Array(m).fill('-')
        seen[i] = new Array(m).fill(false)
        solved[i] = new Array(m).fill(false)
    }
    for(let word of words){
        setWord(word);
    }
}


let last = [-1, -1]
let x = Infinity, y = Infinity
let curWord = ""
let ctn = 0
let path = []
let lastColor = "#000"

function handleClick(){
    for(let block of blocks){
        block.addEventListener("click", (e)=>{
            let [row, col] = [parseInt(block.getAttribute("row")), parseInt(block.getAttribute("col"))]
            if(solved[row][col]) return
            let randColor = colors[Math.floor(Math.random() * colors.length)]
            if(last[0] == -1){
                last = [row, col]
                path.push([row, col])
                curWord += block.textContent
                block.style.background = randColor
                lastColor = randColor
            } else{
                let select = false;
                for(let i = 0; i < 8; ++i){
                    let neiRow = last[0] + dx[i]
                    let neiCol =  last[1] + dy[i]
                    if(row == neiRow && col == neiCol && (x == Infinity ||(last[0] + x === row && last[1] + y == col) )){
                        if(x == Infinity){
                            x = row - last[0]
                            y = col - last[1]
                        }
                        last = [row, col]
                        path.push([row, col])
                        select = true
                        block.style.background = lastColor
                        curWord += block.textContent
                        break
                    }
                       
                }
                if(!select){
                    for(let block of blocks){
                        let [row, col] = [parseInt(block.getAttribute("row")), parseInt(block.getAttribute("col"))]
                        if(!solved[row][col])
                            block.style.background = null 
                    }
                    block.style.background = randColor
                    lastColor = randColor
                    x = Infinity
                    y = Infinity
                    last = [row, col]
                    path = []
                    path.push([row, col])
                    curWord = block.textContent
                }
            }
            if(words.includes(curWord)){
                wordsDiv.querySelector("#"+curWord).style.textDecoration = "line-through"
                ++ctn
                if(ctn == words.length){
                    finishAudio.play()
                }
                 else{
                    winAudio.play()
                }
                for(let pos of path){
                    solved[pos[0]][pos[1]] = true
                }
                curWord = ""
                path = []
                last = [-1, -1]
                x = Infinity
                y = Infinity
            }
        })

    }   
}


function randomPos(){
    let row = Math.floor(Math.random() * n)
    let col = Math.floor(Math.random() * m)
    if(seen[row][col])
    {
        return randomPos();
    }
    return [row, col]
}


function emptyCells(idx, row, col){
    let A = [
        Math.min(row, col),
        col,
        Math.min(n - row - 1, col),
        row,
        n - row - 1,
        Math.min(row, m - col - 1),
        m - col - 1,
        Math.min(n - row -1, m - col - 1)
    ]
    return A[idx]
}

function valid(row, col){
    return row >= 0 && row < n && col >= 0 && col < m
}

function validPath(i, word, row, col, x, y){
    if(i >= word.length) {
        return true
    }
    if(seen[row][col]) return false
    board[row][col] = word[i]
    seen[row][col] = true
    if(validPath(i + 1, word, row + x, col + y, x, y)) return true
    board[row][col] = '-'
    seen[row][col] = false
    return false
}


function shuffle(arr){
   let idx = arr.length
    while(idx != 0){
        let randIdx = Math.floor(Math.random() * idx)
        --idx
        let t = arr[idx]
        arr[idx] = arr[randIdx]
        arr[randIdx] = t
    }
}

function setWord(word){
   let [row, col] = randomPos()
   let possiblePos = []
    for(let i = 0; i < 8; ++i){
        let neiRow = row + dx[i]
        let neiCol = col + dy[i]
        let size = emptyCells(i, row, col)
        if(!valid(neiRow, neiCol) || size < word.length - 1) continue
        possiblePos.push([row + dx[i], col + dy[i]])
    }
    shuffle(possiblePos)
    for(let i = 0; i < possiblePos.length; ++i){
        let [x, y] = [possiblePos[i][0] - row, possiblePos[i][1] - col]
        if(validPath(0,word,row,col,x,y)) return
    }
   setWord(word)
}


function print(){
    for(let i = 0; i < n; ++i){
        let row = document.createElement("tr")
       for(let j = 0; j <m ;++j){
            let node= document.createElement("td")
            node.setAttribute("row", i) 
            node.setAttribute("col", j) 
            if(board[i][j] == "-"){
                node.textContent = String.fromCharCode(Math.floor(65 + Math.random() * 25))
            }
           else {
             node.textContent = board[i][j]
            }
            node.style.textAlign ="center"
            row.append(node)
       }
       grid.append(row)
    }
    for(let word of words){
        let p = document.createElement("p")
        p.setAttribute("id", word)
        p.textContent = word
        wordsDiv.append(p)
    }
    blocks = grid.querySelectorAll("td")
}

start()
print()
handleClick();
