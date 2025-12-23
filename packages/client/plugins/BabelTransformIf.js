const KEYWORD = {
	IF: "If",
	ELSE: "Else",
	END: "End",
	ELSE_IF: "ElseIf"
};

export default function ({ types: t }) {
	const undef = t.unaryExpression("void", t.numericLiteral(0));

	const isSpreadElement = node => node.type === "SpreadElement";

	const normalizeArgument = arg => {
		if (!arg) throw new Error("Syntax error: missing expression");
		if (isSpreadElement(arg)) {
			return t.memberExpression(arg.argument, t.numericLiteral(0));
		} else {
			return arg;
		}
	};

	const buildStatement = from => {
		const callee = from.get("callee");
		if (
			callee.isIdentifier({ name: KEYWORD.IF }) ||
			(callee.isMemberExpression() &&
				callee.get("property").isIdentifier({ name: KEYWORD.ELSE_IF }))
		) {
			const test = normalizeArgument(from.node.arguments[0]);
			const consequent =
				from.parentPath.isCallExpression() &&
				normalizeArgument(from.parentPath.node.arguments[0]);
			if (!consequent)
				throw new Error("Not supported: consequent is not a call expression");
			const alternative = from.parentPath.parentPath.parentPath;
			if (!alternative.isCallExpression())
				throw new Error("Not supported: alternative is not a call expression");
			return t.conditionalExpression(
				test,
				consequent,
				buildStatement(alternative)
			);
		} else if (
			callee.isMemberExpression() &&
			(callee.get("property").isIdentifier({ name: KEYWORD.ELSE }) ||
				callee.get("property").isIdentifier({ name: KEYWORD.END }))
		) {
			return normalizeArgument(from.node.arguments[0] ?? undef);
		} else {
			throw new Error(`Syntax Error: unexpected keyword`);
		}
	};
	return {
		visitor: {
			CallExpression(path) {
				const callee = path.node.callee;
				if (callee.type === "Identifier" && callee.name === "If") {
					const expressionEnd = path.findParent(path => {
						if (path.isCallExpression()) {
							const callee = path.node.callee;
							if (
								callee.type === "MemberExpression" &&
								callee.property.type === "Identifier" &&
								(callee.property.name === "End" ||
									callee.property.name === "Else")
							) {
								return true;
							}
						}
						return false;
					});
					if (!expressionEnd?.isCallExpression()) {
						throw path.buildCodeFrameError(
							"Syntax error: If must be used with an Else or End"
						);
					}
				} else if (
					callee.type === "MemberExpression" &&
					callee.property.type === "Identifier" &&
					(callee.property.name === "Else" || callee.property.name === "End")
				) {
					let IfStatement = path.get("callee");
					while (
						IfStatement &&
						!(
							IfStatement.isCallExpression() &&
							IfStatement.node.callee.type === "Identifier" &&
							IfStatement.node.callee.name === "If"
						)
					) {
						if (IfStatement.isCallExpression()) {
							IfStatement = IfStatement.get("callee");
						} else if (IfStatement.isMemberExpression()) {
							IfStatement = IfStatement.get("object");
						} else {
							IfStatement = null;
						}
					}
					if (IfStatement) {
						path.replaceWith(buildStatement(IfStatement));
					}
				}
			}
		}
	};
}
