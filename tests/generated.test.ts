import { WebSocket, Server, Client } from "mock-socket"

/**
 * @jest-environment jsdom
 */

describe("Test the generated functionality", () => {
	const getParams = jest.fn().mockName("getPcfReloadParams")//.mockReturnValue(undefined)//() => { debugger; return windowParams }).mockName("getWindowParams")
	const setParams = jest.fn().mockName("setPcfReloadParams")//(v) => { debugger; windowParams = v }).mockName("setWindowParams")

	const currentScriptSpy = jest.spyOn(document, 'currentScript', 'get').mockName("document.currentScript")

	const globalSocket = global.WebSocket
	beforeAll(() => {
		Object.defineProperty(window, 'pcfReloadParams', {
			get: getParams,
			set: setParams
		})

		global.WebSocket = WebSocket
	})

	afterAll(() => {
		global.WebSocket = globalSocket
	})

	beforeEach(() => {
		getParams.mockReturnValue(undefined)
		jest.resetAllMocks()
		jest.resetModules()
	})

	it("gets the current script", async () => {
		const tb = await import('./samples/testBase')

		expect(tb).toBeTruthy()
		expect(currentScriptSpy).toBeCalled()
	})

	it("reads params on construction", async () => {
		const tb = await import('./samples/testBase')
		expect(getParams).toBeCalledTimes(1)

		const component = new tb.SampleComponent()

		const counter = tb.getCounter()

		expect(component).toBeDefined()
		expect(counter.ctor).toBe(1)
		expect(counter.init).toBe(0)
		expect(counter.updateView).toBe(0)

		expect(getParams).toBeCalledTimes(2)
		expect(setParams).toBeCalledTimes(0)
	})

	it("calls init and updateView if params are defined", async () => {
		const container = document.createElement("div")
		const noc = jest.fn().mockName("notifyOutputChanged")
		let windowParams = {
			context: {},
			notifyOutputChanged: noc,
			state: {},
			container: container
		}
		getParams.mockReturnValue(windowParams)

		const tb = await import("./samples/testBase")
		
		const counter = tb.getCounter()
		const parameters = tb.getParameters()

		expect(counter.ctor).toBe(1)
		expect(counter.init).toBe(1)
		expect(counter.updateView).toBe(1)

		expect(parameters).toMatchObject({
			...windowParams,
			updateContext: {}
		})

		expect(setParams).toBeCalledTimes(2)
	})

	it.each([["reload", true],["refreshcss", true],["nonce", false]])
		("calls reload on messages ({message} -> {doReload})", async (message, doReload) => {
			const mockServer = new Server("ws://127.0.0.1:8181")

			const tb = await import("./samples/testBase")
			const comp = new tb.SampleComponent()

			comp.init(undefined, undefined, undefined, document.createElement("div"))
			mockServer.emit(message, {})


	})
})