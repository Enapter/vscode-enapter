function main()
    scheduler.add(1000, send_telemetry)
    scheduler.add(30000, send_properties)
end

function send_telemetry()
    enapter.send_telemetry({status = 'ok'})
end

function send_properties()
    enapter.send_properties({
        vendor = 'Enapter',
        model = 'ENP-RS232'
    })
end

main()
