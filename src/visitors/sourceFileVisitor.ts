import {
	factory,
	forEachChild,
	isClassDeclaration,
	Node,
	SourceFile,
	SyntaxKind,
	TransformationContext,
	visitEachChild,
} from "typescript";

import {
	createAndDeclareWindowInterface,
	createConstructorCall,
	createConstructorDeclaration,
	createCurrentScriptAssignment,
	createListenerMethod,
	createParamsType,
	createRefreshMethod,
} from "@/lib";
import { IPluginConfig } from "@/pluginConfig";
import {
	classVisitor,
	constructorVisitor,
} from "@/visitors";

export const visitor = (sourceFile: SourceFile, opts: IPluginConfig, ctx: TransformationContext) =>
	(node: Node): Node[] | Node => {
		// Check: Not a class, skip it
		if (!isClassDeclaration(node)) return node

		// Check: Implements ComponentFramework.StandardControl
		const implement = node.heritageClauses?.filter(h => h.token == SyntaxKind.ImplementsKeyword
			&& h.types.find(t => t.getText() === "ComponentFramework.StandardControl<IInputs, IOutputs>"))

		if (!implement?.length) return node

		// Check: Has class name so we can construct meaninfully
		const className = node.name
		if (!className) return node

		if (opts.verbose) {
			const fileName = sourceFile.fileName
			const pos = sourceFile.getLineAndCharacterOfPosition(node.getStart());
			console.log(`Found class: ${className.getText()} in ${fileName}:${pos.line + 1}`)
		}

		// We are in the main class, implementing ComponentFramework.StandardControl<IInputs, IOutputs>

		// Generate constructor for after class declaration
		const constructorDeclaration = createConstructorCall(className)

		const scriptAssignment = createCurrentScriptAssignment()

		const typeDef = createParamsType()

		const windowDeclaration = createAndDeclareWindowInterface()

		const { listener: listenMethod, socketVarDecl } = createListenerMethod(opts.wsAddress)

		const refreshMethod = createRefreshMethod()

		// Check if the class has a constructor to hook into
		const foundConstructor = forEachChild(node, constructorVisitor)

		// No constructor found, inject it
		const constructor = (!foundConstructor)
			? createConstructorDeclaration()
			: undefined

		// We want the class declaration as well, with modified methods
		const classDeclaration = visitEachChild(node, classVisitor, ctx)

		const newClass = factory.updateClassDeclaration(
			classDeclaration,
			classDeclaration.decorators,
			classDeclaration.modifiers,
			classDeclaration.name,
			classDeclaration.typeParameters,
			classDeclaration.heritageClauses,
			[
				...classDeclaration.members,
				...(constructor ? [constructor] : []),
				socketVarDecl,
				listenMethod,
				refreshMethod
			]
		)

		return [
			typeDef,
			...windowDeclaration,
			scriptAssignment,
			newClass,
			constructorDeclaration
		]
	}