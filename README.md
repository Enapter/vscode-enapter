# Enapter EMS Toolkit 3.0 IDE

<p align="center">
    <img 
        align="center"
        src="https://github.com/Enapter/vscode-enapter/blob/main/images/enapter-logo.png?raw=true" 
        alt="Enapter"
        height="128"
    />
</p>

Create and upload Blueprints for Enapter's Energy Management System. It provides integrated tools for authoring Blueprints, connecting to Enapter Gateways, and managing of provisioned devices.

## Features

### Site & Device Management
- Connect to [Enapter Gateway](https://handbook.enapter.com/software/gateway_software/)
- View devices provisioned to Enapter Gateway
- Connect to devices to view their logs

### Blueprint Development
- Create, edit and upload Enapter Blueprints

### User Interface
Three specialized panels:

1. **Active Device** — Shows selected device with status, properties, logs, and available commands
2. **All Devices On Site** — Lists all devices from connected Enapter Gateway
3. **Site Connections** — Manages connections to Enapter Gateways

## Getting Started

### 1. Connect to Enapter Gateway
1. Open the Enapter sidebar
2. In the **Site Connections** view, click the "+" button
3. Enter Gateway address and API token

### 2. Select an Active Device
1. Browse available devices in the **All Devices On Site** view
2. Click the "Connect" button on any device to make it active
3. The device will appear in the **Active Device** view

### 3. Develop Blueprints
1. Create or open a `manifest.yml` file
2. Edit your blueprint configuration and Lua code
3. 
4. Monitor device logs in real-time through the **Active Device** view
Please refer to the [Enapter Documentation](https://developers.enapter.com/) for detailed guidance on creating Blueprints.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### Common Issues

**Connection Problems:**
- Verify your API token is valid
- Check network connectivity to Enapter Cloud or Gateway
- Ensure Gateway is accessible from your development machine

**Blueprint Upload Failures:**
- Validate your `manifest.yml` syntax
- Ensure the active device supports the blueprint version
- Check device logs for detailed error messages

**Extension Not Loading:**
- Restart VSCode
- Check the Output panel for error messages
- Verify VSCode version compatibility (1.103.0+)

## License

Licensed under the Apache License, Version 2.0. See [LICENCE](LICENCE) for details.

## Support

- **Issues:** [GitHub Issues](https://github.com/Enapter/vscode-enapter/issues)
- **Documentation:** [Enapter Developers](https://developers.enapter.com)
- **Community:** [Enapter Discord](https://go.enapter.com/discord)
