from datetime import datetime

content = f"""
AI情报日报测试

生成时间：
{datetime.now()}

状态：
自动生成成功
"""

with open("daily_news.txt", "w", encoding="utf-8") as f:
    f.write(content)

print("日报生成完成")
