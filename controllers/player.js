const { Player, Submit, Table } = require("../models/load");

exports.getPlayer = async (req, res) => {

    p = await Player.findByPk(req.params.id);

    if (req.query.s == "yes") {
        submits = await Submit.findAll({ where: { player_id: p.id }, order: [['year', 'DESC'], ['month', 'DESC']], raw: true });

        await Promise.all(submits.map(async (submit) => {

            resources = await Submit.findOne({
                attributes: ["player_id", "new_resources"],
                where: { month: submit.month, year: submit.year },
                order: [["new_resources", "DESC"], ["new_points", "DESC"]],
                raw: true
            })

            points = await Submit.findOne({
                attributes: ["player_id", "new_points"],
                where: { month: submit.month, year: submit.year },
                order: [["new_points", "DESC"], ["new_resources", "DESC"]],
                raw: true
            })

            trophies = await Submit.findOne({
                attributes: ["player_id", "new_trophies"],
                where: { month: submit.month, year: submit.year },
                order: [["new_trophies", "DESC"], ["new_resources", "DESC"]],
                raw: true
            })

            submit.winner_r = resources.player_id == submit.player_id
            submit.winner_p = points.player_id == submit.player_id
            submit.winner_t = trophies.player_id == submit.player_id

        }));



        res.send({ player: p, submits: submits });

    }
    else res.send(p);

}

exports.getPlayers = async (req, res) => {

    if (req.query.s == 'hidden') res.send(await Player.findAll({ where: { inside: 0 } }));
    else if (req.query.s == 'active') res.send(await Player.findAll({ where: { inside: 1 } }));
    else res.send(await Player.findAll());
}

exports.updateSubmit = async (req, res) => {

    const submit = await Submit.findByPk(req.params.id);

    await submit.update(req.body);

    res.send(submit);
}
exports.deleteSubmit = async (req, res) => {

    const submit = await Submit.findByPk(req.params.id);

    await submit.destroy();

    res.sendStatus(200);

}

exports.storeSubmit = async (req, res) => {

    const day = new Date();
    day.setMonth(day.getMonth() - 1);
    const month_prev = day.getMonth();
    const year_prev = day.getFullYear();


    var resources = parseInt(req.body.resources);
    var points = parseInt(req.body.points);
    var trophies = parseInt(req.body.trophies);
    var id = req.body.player_id;

    const lastMonthData = await Submit.findOne({ where: { player_id: id }, order: [["year", "DESC"], ["month", "DESC"]] });

    new_resources = lastMonthData?.resources ? resources - lastMonthData.resources : resources;
    new_points = lastMonthData?.points ? points - lastMonthData.resources : points;
    new_trophies = lastMonthData?.trophies ? trophies - lastMonthData.trophies : trophies;

    month = (req.body["month"] ? req.body["month"] : month_prev);
    year = (req.body["year"] ? req.body["year"] : year_prev);



    r = await Submit.create({
        'month': month,
        'year': year,
        'player_id': id,
        'resources': resources,
        'points': points,
        'new_resources': new_resources,
        'new_points': new_points,
        'trophies': trophies,
        'new_trophies': new_trophies
    });

    res.send(r);
    //! NEED TO CLEAN THE PLAYER'S ROW INTO THE TEMP TABLE ///
    //!
    //!
    //!
    //! //////////////////////////////////////////////////////
}
