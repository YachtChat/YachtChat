async function processEvent(event, {global, storage}) {
    if(event.event != "spaceWithOtherUser" || event.distinct_id == "-1"){
        return event
    }

    console.log(`Will process Event ${event.event} for user ${event.distinct_id}`)

    const timestamp = event.timestamp || event.properties?.timestamp || event.now || event.sent_at
    const dateObj = new Date(timestamp)

    // set event for user for this week to true
    const mondayString: String = getStringFromDate(getMonday(dateObj));
    const key: String = JSON.stringify([event.event, event.distinct_id, mondayString])
    // check if key is set for this week if not set it
    if(!(await storage.get(key))){
        storage.set(key, true)
        console.debug(`Storage for ${key} set to true`)
    }else{
        console.debug(`Storage for ${key} was already set to true`)
    }

    // check if event was triggered for this user before in the last 4 weeks -> was active before this month variable
    const previousMondays: String[] = getPreviousMondays(getMonday(dateObj));
    const previousKeys: String[] = previousMondays.map(day => JSON.stringify([event.event, event.distinct_id, day]))
    var counter: number = 0;
    for(const prevKey of previousKeys){

        console.debug(`Storage for key ${prevKey} checked`)

        if(await storage.get(prevKey)){
            counter += 1

            console.debug(`Storage for key ${prevKey} was true`)
        }
    }
    event.properties['is_active_user'] = (counter > 0)
    console.debug(`Is active user for event was set to ${(counter > 0)} for user ${event.distinct_id}`)
    event.properties['active_weeks_last_months'] = counter
    console.debug(`Counter was ${counter} for user ${event.distinct_id}`)
    return event
}

function getMonday(d: Date): Date{
    var day = d.getDay(), diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
    return new Date(d.setDate(diff))
}
function getStringFromDate(d:Date): String{
    return d.toISOString().split("T")[0]
}

function getPreviousMondays(d: Date): String[]{
    var lastMonadys: String[] = [];
    lastMonadys.push(getStringFromDate(new Date(d.setDate(d.getDate() - 7))))
    lastMonadys.push(getStringFromDate(new Date(d.setDate(d.getDate() - 7))))
    lastMonadys.push(getStringFromDate(new Date(d.setDate(d.getDate() - 7))))
    lastMonadys.push(getStringFromDate(new Date(d.setDate(d.getDate() - 7))))
    return lastMonadys
}
