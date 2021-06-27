import view from './view.js'
import BlockStreamer from './blockStreamer.js'

export default class extends view {
    constructor() {
        super()
        this.setTitle()
    }

    getHtml() {
        return `
            <div class="row">
                <div class="col-12 col-md-4">
                    <h3>Supply Info</h3>
                    <table class="table table-sm">
                        <tr><th scope="row">Circulating</th><td id="supply-circulating">Loading...</td></tr>
                        <tr><th scope="row">Unclaimed</th><td id="supply-unclaimed">Loading...</td></tr>
                        <tr><th scope="row">Total</th><td id="supply-total">Loading...</td></tr>
                    </table><br>
                    <h3>Reward Pool</h3>
                    <table class="table table-sm">
                        <tr><th scope="row">Cycle</th><td>9,600 blocks</td></tr>
                        <tr><th scope="row">Theoretical</th><td id="rp-theo">Loading...</td></tr>
                        <tr><th scope="row">Distributed</th><td id="rp-dist">Loading...</td></tr>
                        <tr><th scope="row">Available</th><td id="rp-avail">Loading...</td></tr>
                        <tr><th scope="row">Burned</th><td id="rp-burn">Loading...</td></tr>
                        <tr><th scope="row">Votes Spent</th><td id="rp-votes">Loading...</td></tr>
                    </table><br>
                    <h3>Chain Properties</h3>
                    <table class="table table-sm" id="dblocks-props-tbl"><tbody>
                        <tr><th scope="row">Chain ID</th><td>da5fe18d0844f1f97bf5a94e7780dec18b4ab015e32383ede77158e059bacbb2</td></tr>
                        <tr><th scope="row">Block Time</th><td>3 seconds</td></tr>
                        <tr><th scope="row">VP Growth</th><td>1 VP/DTUBE/hour</td></tr>
                        <tr><th scope="row">VP per burn</th><td>4,400 VP/DTUBE</td></tr>
                        <tr><th scope="row">BW Growth</th><td>10 bytes/DTUBE/hour</td></tr>
                        <tr><th scope="row">BW Max</th><td>64,000 bytes</td></tr>
                        <tr><th scope="row">Leaders</th><td>13</td></tr>
                        <tr><th scope="row">Block Reward</th><td>0.01 DTUBE</td></tr>
                        <tr><th scope="row">Block Reward VP</th><td>100 VP</td></tr>
                        <tr><th scope="row">Master account</th><td>dtube</td></tr>
                        <tr><th scope="row">Master fee</th><td>10%</td></tr>
                        <tr><th scope="row">Max Subscribes</th><td>2,000</td></tr>
                    </tbody></table>
                </div>
                <div class="col-12 col-md">
                    <h3>Latest Blocks</h3>
                    <div id="newblockslst"></div>
                </div>
            </div>
        `
    }

    init() {
        // Load supply and reward pool, and update every 10 seconds
        this.updateChainInfo()
        let blkStreamer = new BlockStreamer()
        blkStreamer.streamBlocks((newBlock) => $('#newblockslst').prepend(this.newBlockCardHtml(newBlock)))
        intervals.push(setInterval(this.updateChainInfo,10000))
    }

    updateChainInfo() {
        axios.get(config.api + '/supply').then((supplyRes) => {
            $('#supply-circulating').text(thousandSeperator(supplyRes.data.circulating / 100) + ' DTUBE')
            $('#supply-unclaimed').text(thousandSeperator(Math.ceil(supplyRes.data.unclaimed) / 100) + ' DTUBE')
            $('#supply-total').text(thousandSeperator(Math.ceil(supplyRes.data.total) / 100) + ' DTUBE')
        })
    
        axios.get(config.api + '/rewardPool').then((rpRes) => {
            $('#rp-theo').text(thousandSeperator(rpRes.data.theo / 100) + ' DTUBE')
            $('#rp-dist').text(thousandSeperator(Math.ceil(rpRes.data.dist) / 100) + ' DTUBE')
            $('#rp-avail').text(thousandSeperator(Math.ceil(rpRes.data.avail) / 100) + ' DTUBE')
            $('#rp-burn').text(thousandSeperator(Math.ceil(rpRes.data.burn) / 100) + ' DTUBE')
            $('#rp-votes').text(thousandSeperator(Math.ceil(rpRes.data.votes)) + ' VP')
        })
    }

    newBlockCardHtml(block) {
        let blockCardHtml = '<div class="card dblocks-card" style="flex-direction:initial">'
        blockCardHtml += '<a href="#/b/'+block._id+'">#'+block._id+'</a>'
        blockCardHtml += '&nbsp;by&nbsp;'
        blockCardHtml += '<a href="#/@'+block.miner+'">'+block.miner+'</a>'
        blockCardHtml += '&nbsp;-&nbsp;'
        blockCardHtml += block.txs.length
    
        if (isPuralArr(block.txs))
            blockCardHtml += ' tx(s), '
        else
            blockCardHtml += ' tx, dist: '
        
        blockCardHtml += (Math.ceil(block.dist) / 100)
        blockCardHtml += ' DTUBE'
    
        if (block.burn) {
            blockCardHtml += ', burned: '
            blockCardHtml += (Math.ceil(block.burn) / 100)
            blockCardHtml += ' DTUBE'
        }
        blockCardHtml += '</div>'
        return blockCardHtml
    }
}
